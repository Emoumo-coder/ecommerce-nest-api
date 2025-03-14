import { Body, Controller, HttpCode, Post, UseGuards, Request, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/decorators/user-id.decorator';
import { BuyerLoginResponse } from 'src/interfaces/buyer-login.response.interface';
import { CommonResponse } from 'src/interfaces/common-response.interface';
import { SellerLoginResponse } from 'src/interfaces/seller-login.response.interface';
import { AuthCredentialsRequestDto } from '../dtos/auth-credentials.request.dto';
import { CreateBuyerRequestDto } from '../dtos/create-buyer.request.dto';
import { CreateSellerRequestDto } from '../dtos/create-seller.dto';
import { AuthService } from './auth.service';
import { BuyerGoogleOAuthGuard } from './guards/buyer-google-oauth.guard';
import { BuyerLocalAuthGuard } from './guards/buyer-local.auth.guard';
import { SellerLocalAuthGuard } from './guards/seller-local.auth.guard';

@Controller('auth')
@ApiTags('Auth API')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(201)
  @Post('/signup')
  @ApiOperation({ summary: 'buyer Signup API', description: 'buyer registration functionality' })
  async buyerSignUp(@Body() createBuyerRequestDto: CreateBuyerRequestDto): Promise<CommonResponse<BuyerLoginResponse>> {
    const data = await this.authService.buyerSignUp(createBuyerRequestDto);
    return { data, message: 'Signup completed successfully.' };
  }

  @UseGuards(BuyerLocalAuthGuard)
  @HttpCode(201)
  @Post('/signin')
  @ApiOperation({ summary: 'buyer Login API', description: 'buyer login functionality' })
  async buyerSignIn(
    @UserId() buyerId: number,
    @Body() authCredentialsRequestDto: AuthCredentialsRequestDto,
  ): Promise<CommonResponse<BuyerLoginResponse>> {
    const data = await this.authService.buyerLogin(buyerId);
    return { data, message: 'Login successful.' };
  }

  @HttpCode(201)
  @Post('/refresh')
  @ApiOperation({ summary: 'buyer Refresh API', description: 'Buyer access token renewal functionality' })
  async buyerRefresh(@Body() { refreshToken }: { refreshToken: string }): Promise<CommonResponse<BuyerLoginResponse>> {
    const data = await this.authService.buyerRefresh(refreshToken);
    return { data };
  }

  @UseGuards(BuyerGoogleOAuthGuard)
  @Get('google')
  @ApiOperation({ summary: 'Buyer Google Login API', description: 'Buyer Google OAuth functionality' })
  async googleAuth() {}

  @UseGuards(BuyerGoogleOAuthGuard)
  @Get('google/callback')
  @ApiOperation({ summary: 'Buyer Google OAuth Callback API', description: 'Buyer Google OAuth token issuance functionality' })
  async googleAuthRedirect(@Request() req): Promise<CommonResponse<BuyerLoginResponse>> {
    const data = await this.authService.buyerGoogleOAuthLogin(req.user);
    return { data };
  }

  @HttpCode(201)
  @Post('/signup-seller')
  @ApiOperation({ summary: 'Seller Signup API', description: 'Seller registration functionality' })
  async sellerSignUp(
    @Body() createBuyerRequestDto: CreateSellerRequestDto,
  ): Promise<CommonResponse<SellerLoginResponse>> {
    const data = await this.authService.sellerSignUp(createBuyerRequestDto);
    return { data, message: 'Signup completed successfully.' };
  }

  @UseGuards(SellerLocalAuthGuard)
  @HttpCode(201)
  @Post('/signin-seller')
  @ApiOperation({ summary: 'Seller Login API', description: 'Seller password matching' })
  async sellerSignIn(
    @UserId() sellerId: number,
    @Body() authCredentialsRequestDto: AuthCredentialsRequestDto,
  ): Promise<CommonResponse<SellerLoginResponse>> {
    const data = await this.authService.sellerLogin(sellerId);
    return { data, message: 'Login successful.' };
  }

  @HttpCode(201)
  @Post('/refresh-seller')
  @ApiOperation({ summary: 'seller Refresh API', description: 'Seller access token renewal functionality' })
  async sellerRefresh(
    @Body() { refreshToken }: { refreshToken: string },
  ): Promise<CommonResponse<SellerLoginResponse>> {
    const data = await this.authService.sellerRefresh(refreshToken);
    return { data };
  }
}
