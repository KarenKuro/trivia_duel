import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Profile, Strategy } from 'passport-facebook';

import { IFacebookPayload } from '@common/models';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FB_APP_ID,
      clientSecret: process.env.FB_APP_SECRET,
      callbackURL: 'http://localhost:3002/v1/auth/facebook/login',
      profileFields: ['id', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err, user, info?) => void,
  ) {
    const { id, name } = profile;

    const { givenName: firstName, familyName: lastName } = name;
    const payload: IFacebookPayload = {
      id,
      firstName,
      lastName,
      accessToken,
      refreshToken,
    };
    console.log(payload);

    done(null, payload);
  }
}
