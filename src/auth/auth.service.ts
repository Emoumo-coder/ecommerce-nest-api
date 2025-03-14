import bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { BuyerGoogleCredentialsRequest } from 'src/interfaces/buyer-google-login.request.interface';
import { BuyerLoginResponse } from 'src/interfaces/buyer-login.response.interface';
import { SellerLoginResponse } from 'src/interfaces/seller-login.response.interface';
import { PrismaService } from 'src/services/prisma.service';
import { NullablePartial } from 'src/types/nullable_partial-type';
import { oauthProviderType } from 'src/types/oauth.provider.type';
import { AuthCredentialsRequestDto } from '../dtos/auth-credentials.request.dto';
import { CreateBuyerRequestDto } from '../dtos/create-buyer.request.dto';
import { CreateSellerRequestDto } from '../dtos/create-seller.dto';
import {
  AuthForbiddenException,
  BuyerRefreshUnauthrizedException,
  BuyerUnauthrizedException,
  OAuthNotFoundException,
  SellerEmailNotFoundException,
  SellerNotFoundException,
  SellerUnauthrizedException,
} from '../exceptions/auth.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Handles buyer sign-up.
   * Saves the buyer and encrypts the password.
   */
  async buyerSignUp(createBuyerRequestDto: CreateBuyerRequestDto): Promise<BuyerLoginResponse> {
    const { id } = await this.createBuyer(createBuyerRequestDto);
    const { accessToken, refreshToken } = await this.buyerLogin(id);
    return { id, accessToken, refreshToken };
  }

  /**
   * Handles seller sign-up.
   * Saves the seller and encrypts the password.
   */
  async sellerSignUp(createSellerRequestDto: CreateSellerRequestDto): Promise<SellerLoginResponse> {
    const { id } = await this.createSeller(createSellerRequestDto);
    const { accessToken, refreshToken } = await this.sellerLogin(id);
    return { id, accessToken, refreshToken };
  }

  /**
   * Validates buyer login credentials.
   * Called by passport validate.
   *
   * @param authCredentialsDto Contains buyer's email and password.
   */
  async validateBuyer(authCredentialsDto: AuthCredentialsRequestDto): Promise<{ id: number }> {
    const buyer = await this.prisma.buyer.findFirst({
      select: { id: true, password: true },
      where: { email: authCredentialsDto.email, oauthProvider: null },
    });

    if (buyer && buyer.password) {
      const isRightPassword = await bcrypt.compare(authCredentialsDto.password, buyer.password);
      if (isRightPassword) {
        return { id: buyer.id };
      }
    }
    throw new SellerNotFoundException();
  }

  /**
   * Verifies the buyer's refresh token and issues a new token.
   *
   * @param refreshToken
   */
  async buyerRefresh(refreshToken: string): Promise<BuyerLoginResponse> {
    const { id } = await this.verifyBuyerRefreshToken(refreshToken);
    return await this.buyerLogin(id);
  }

  /**
   * Handles buyer Google login.
   * If the email is not registered, a new buyer is created.
   * Otherwise, a JWT token is issued.
   *
   * @param buyerGoogleCredentialsRequest Data from BuyerGoogleStrategy.
   */
  async buyerGoogleOAuthLogin(
    buyerGoogleCredentialsRequest: BuyerGoogleCredentialsRequest,
  ): Promise<BuyerLoginResponse> {
    if (!buyerGoogleCredentialsRequest.id) {
      throw new OAuthNotFoundException();
    }
    return await this.handleGoogleOAuthBuyerLogin(buyerGoogleCredentialsRequest);
  }

  /**
   * Validates seller login credentials.
   * Called by passport validate.
   *
   * @param authCredentialsDto Contains seller's email and password.
   */
  async validateSeller(authCredentialsDto: AuthCredentialsRequestDto): Promise<{ id: number }> {
    const seller = await this.prisma.seller.findUnique({
      select: { id: true, password: true },
      where: { email: authCredentialsDto.email },
    });

    if (seller) {
      const isRightPassword = await bcrypt.compare(authCredentialsDto.password, seller.password);
      if (isRightPassword) {
        return { id: seller.id };
      }
    }
    throw new SellerNotFoundException();
  }

  /**
   * Verifies the seller's refresh token and issues a new token.
   *
   * @param refreshToken
   */
  async sellerRefresh(refreshToken: string): Promise<BuyerLoginResponse> {
    const { id } = await this.verifySellerRefreshToken(refreshToken);
    return await this.buyerLogin(id);
  }

  /**
   * Issues an access token for buyer login.
   * @param id The buyer's ID to be used in the JWT payload.
   */
  async buyerLogin(id: number): Promise<BuyerLoginResponse> {
    const payload: { id: number } = { id };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET_BUYER'),
      expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET_BUYER'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
    });

    return { id, accessToken, refreshToken };
  }

  /**
   * Issues an access token for seller login.
   * @param id The seller's ID to be used in the JWT payload.
   */
  async sellerLogin(id: number): Promise<SellerLoginResponse> {
    const payload: { id: number } = { id };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET_SELLER'),
      expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET_SELLER'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
    });

    return { id, accessToken, refreshToken };
  }

  /**
   * Checks if the buyer's email exists.
   * @param email Email to be checked.
   */
  async findBuyerEmail(email: string): Promise<{ id: number }> {
    const buyerId = await this.prisma.buyer.findFirst({
      select: { id: true },
      where: { email, oauthProvider: null },
    });

    if (!buyerId) {
      throw new SellerEmailNotFoundException();
    }
    return buyerId;
  }

  /**
   * Checks if the seller's email exists.
   * @param email Email to be checked.
   */
  async findSellerEmail(email: string): Promise<{ id: number }> {
    const sellerId = await this.prisma.seller.findUnique({
      select: { id: true },
      where: { email },
    });

    if (!sellerId) {
      throw new SellerEmailNotFoundException();
    }
    return sellerId;
  }

  /**
   * Checks if the buyer's ID exists.
   * @param id ID to be checked.
   */
  async findBuyer(id: number): Promise<{ id: number }> {
    const buyerId = await this.prisma.buyer.findUnique({
      select: { id: true },
      where: { id },
    });

    if (!buyerId) {
      throw new AuthForbiddenException();
    }
    return buyerId;
  }

  /**
   * Checks if the seller's ID exists.
   * @param id ID to be checked.
   */
  async findSeller(id: number): Promise<{ id: number }> {
    const sellerId = await this.prisma.seller.findUnique({
      select: { id: true },
      where: { id },
    });

    if (!sellerId) {
      throw new AuthForbiddenException();
    }
    return sellerId;
  }


  private async createBuyer(createBuyerRequestDto: CreateBuyerRequestDto): Promise<{ id: number }> {
    const { email, password, name, gender, age, phone } = createBuyerRequestDto;
    const buyer = await this.prisma.buyer.findFirst({ select: { id: true }, where: { email, oauthProvider: null } });
    if (buyer) {
      throw new BuyerUnauthrizedException();
    }

    const hashedPassword = await this.hashPassword(password);

    const buyerId = await this.prisma.buyer.create({
      select: { id: true },
      data: { email, password: hashedPassword, name, gender, age, phone },
    });

    return buyerId;
  }

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  private async verifyBuyerRefreshToken(refreshToken: string): Promise<{ id: number }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET_BUYER'),
      });
      return payload as { id: number };
    } catch (error) {
      throw new BuyerRefreshUnauthrizedException();
    }
  }

  private async createSeller(createSellerRequestDto: CreateSellerRequestDto): Promise<{ id: number }> {
    const { email, password, name, phone, businessNumber } = createSellerRequestDto;
    const seller = await this.prisma.seller.findUnique({
      select: { id: true },
      where: { email },
    });

    if (seller) {
      throw new SellerUnauthrizedException();
    }

    const hashedPassword = await this.hashPassword(password);

    const sellerId = await this.prisma.seller.create({
      select: { id: true },
      data: { email, password: hashedPassword, name, phone, businessNumber },
    });
    return sellerId;
  }

  private async verifySellerRefreshToken(refreshToken: string): Promise<{ id: number }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET_SELLER'),
      });
      return payload as { id: number };
    } catch (error) {
      throw new SellerEmailNotFoundException();
    }
  }

  private async handleGoogleOAuthBuyerLogin(buyerGoogleCredentialsReuqest: BuyerGoogleCredentialsRequest) {
    const { id, accessToken, refreshToken, email, name } = buyerGoogleCredentialsReuqest;

    const buyer = await this.findOAuthBuyer(id, 'GOOGLE');
    if (!buyer) {
      return await this.createOAuthBuyerAndLogin({ email, name }, id, 'GOOGLE');
    }
    return await this.buyerLogin(buyer.id);
  }

  private async findOAuthBuyer(oauthId: string, oauthProvider: oauthProviderType): Promise<{ id: number } | null> {
    return await this.prisma.buyer.findFirst({
      select: { id: true },
      where: { oauthId, oauthProvider },
    });
  }

  private async createOAuthBuyerAndLogin(
    createBuyerRequestDto: NullablePartial<CreateBuyerRequestDto>,
    oauthId: string,
    oauthProvider: oauthProviderType,
  ): Promise<BuyerLoginResponse> {
    const { email, password, name, gender, age, phone } = createBuyerRequestDto;

    const fallbackName = `${oauthId}_${oauthProvider}`;

    const { id } = await this.prisma.buyer.create({
      select: { id: true },
      data: {
        email: email ?? null,
        password: password ?? null,
        name: name ?? fallbackName,
        gender: gender ?? null,
        age: age ?? null,
        phone: phone ?? null,
        oauthId,
        oauthProvider,
      },
    });

    return await this.buyerLogin(id);
  }
}
