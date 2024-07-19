import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FB_APP_ID,
      clientSecret: process.env.FB_APP_SECRET,
      callbackURL: 'http://localhost:3000/v1/auth/facebook/login',
      profileFields: ['id', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { id, name } = profile;

    const { givenName: firstName, familyName: lastname } = name;
    const payload = {
      id,
      firstName,
      lastname,
      accessToken,
      refreshToken,
    };

    done(null, payload);
  }
}
