import { UserData } from '@repo/typesystem';
import { jwtVerify } from 'jose';
import { env } from '../../env';

export async function verifyAuthentication(accessToken: string) {
  const accessTokenSecret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET);
  const { payload } = await jwtVerify(String(accessToken), accessTokenSecret);
  return UserData.parse(payload);
}
