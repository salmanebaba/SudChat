import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userModel.findOne({ email: normalizedEmail });
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(email: string, pass: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const saltRounds = Number(this.configService.get('BCRYPT_ROUNDS')) || 10;
    const hashedPassword = await bcrypt.hash(pass, saltRounds);
    const newUser = new this.userModel({ email: normalizedEmail, password: hashedPassword });
    return newUser.save();
  }
}
