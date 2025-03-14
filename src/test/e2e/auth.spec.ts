import axios, { AxiosError } from 'axios';
import { randomInt } from 'crypto';
import { v4 } from 'uuid';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { test_buyer_refresh } from '../features/auth/test_buyer_refresh';
import { test_buyer_sign_in } from '../features/auth/test_buyer_sign_in';
import { test_buyer_sign_up } from '../features/auth/test_buyer_sign_up';
import { test_seller_refresh } from '../features/auth/test_seller_refresh';
import { test_seller_sign_in } from '../features/auth/test_seller_sign_in';
import { test_seller_sign_up } from '../features/auth/test_seller_sign_up';

describe('Controller', () => {
  const PORT = randomInt(20000, 50000);
  let server: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    server = await app.init();
    await server.listen(PORT);
  });

  afterAll(async () => {
    await server.close();
  });

  describe('Buyer Tests', () => {
    it('Should successfully register a buyer.', async () => {
      const response = await test_buyer_sign_up(PORT);

      expect(response.data.id).toBeDefined();
      expect(response.data.accessToken).toBeDefined();
      expect(response.data.refreshToken).toBeDefined();
    });

    it('Should successfully log in a buyer. If registration fails, login should also fail.', async () => {
      const response = await test_buyer_sign_in(PORT, {
        email: `${v4()}@gmail.com`,
        password: v4().slice(0, 20),
      });
      expect(response.data).toBeDefined();
    });

    it('Upon successful login, an AccessToken and RefreshToken should be issued.', async () => {
      const response = await test_buyer_sign_in(PORT, {
        email: `${v4()}@gmail.com`,
        password: v4().slice(0, 20),
      });
      expect(response.data.id).toBeDefined();
      expect(response.data.accessToken).toBeDefined();
      expect(response.data.refreshToken).toBeDefined();
    });

    it('If the buyer RefreshToken is valid, an access token should be renewed using it.', async () => {
      const loginResponse = await test_buyer_sign_in(PORT, {
        email: `${v4()}@gmail.com`,
        password: v4().slice(0, 20),
      });

      const accessToken = loginResponse.data.accessToken;
      const refreshToken = loginResponse.data.refreshToken;
      expect(refreshToken).toBeDefined();

      const refreshResponse = await test_buyer_refresh(PORT, refreshToken);
      expect(refreshResponse.data.accessToken).toBeDefined();
      expect(refreshResponse.data.refreshToken).toBeDefined();
    });

    it('When a buyer attempts to log in via Google OAuth, it should redirect to the Google login page.', async () => {
      try {
        await axios.get(`http://localhost:${PORT}/auth/google`, { maxRedirects: 0 });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(302);
          expect(axiosError.response?.headers.location?.startsWith('https://accounts.google.com')).toBe(true);
        } else {
          throw error;
        }
      }
    });
  });

  describe('Seller Tests', () => {
    it('Should successfully register a seller.', async () => {
      const response = await test_seller_sign_up(PORT);

      expect(response.data.id).toBeDefined();
      expect(response.data.accessToken).toBeDefined();
      expect(response.data.refreshToken).toBeDefined();
    });

    it('Should successfully log in a seller. If registration fails, login should also fail.', async () => {
      const response = await test_seller_sign_in(PORT, {
        email: `${v4()}@gmail.com`,
        password: v4().slice(0, 20),
      });

      expect(response.data.id).toBeDefined();
      expect(response.data.accessToken).toBeDefined();
      expect(response.data.refreshToken).toBeDefined();
      expect(typeof response.data.accessToken === 'string').toBe(true);
    });

    it('If the seller RefreshToken is valid, an access token should be renewed using it.', async () => {
      const loginResponse = await test_seller_sign_in(PORT, {
        email: `${v4()}@gmail.com`,
        password: v4().slice(0, 20),
      });

      const refreshToken = loginResponse.data.refreshToken;
      expect(refreshToken).toBeDefined();

      const refreshResponse = await test_seller_refresh(PORT, refreshToken);
      expect(refreshResponse.data.accessToken).toBeDefined();
      expect(refreshResponse.data.refreshToken).toBeDefined();
    });
  });
});

