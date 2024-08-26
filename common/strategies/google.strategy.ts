import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

import { IGooglePayload } from '@common/models';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: 'http://localhost:3000/v1/auth/google/login',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { name, id } = profile;
    const payload: IGooglePayload = {
      id: id,
      firstName: name.givenName,
      lastName: name.familyName,
      accessToken,
      refreshToken,
    };

    done(null, payload);
  }
}
