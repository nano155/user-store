import { bcryptAdapter, envs, JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import {
  CustomError,
  LoginUserDto,
  RegisterUserDto,
  UserEntity,
} from "../../domain";

import { EmailService } from "./email.service";

export class AuthService {
  constructor(private readonly emailService: EmailService) {}

  public async registerUser(dto: RegisterUserDto) {
    const existUser = await UserModel.findOne({ email: dto.email });

    if (existUser) throw CustomError.badRequest("Email already exist");

    try {
      const user = new UserModel(dto);
      user.password = bcryptAdapter.hash(dto.password);
      await user.save();

      this.sendEmailValidationLink(user.email);

      const { password, ...userEntity } = UserEntity.fromObject(user);

      const token = await JwtAdapter.generateToken({ id: user.id });
      if (!token) throw CustomError.internalServer(`Error while creating JWT`);

      return {
        user: userEntity,
        token: token,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  public async loginUser(dto: LoginUserDto) {
    try {
      const user = await UserModel.findOne({ email: dto.email });
      if (!user) throw CustomError.badRequest("User not found");
      const isMatching = bcryptAdapter.compare(dto.password, user.password);
      if (!isMatching) throw CustomError.badRequest("invalid credentials");

      const { password, ...infoUser } = UserEntity.fromObject(user);

      const token = await JwtAdapter.generateToken({
        id: user.id,
        email: user.email,
      });
      if (!token) throw CustomError.internalServer("Error while creating JWT");

      return {
        user: infoUser,
        token: token,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  private async sendEmailValidationLink(email: string) {
    const token = await JwtAdapter.generateToken({ email });
    if (!token) throw CustomError.internalServer("Error getting token");

    const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${token}`;

    // console.log(link);
    
    const html = `
    <h1>Validate your email</h1>
    <p>Click on the following link to validate your email</p>
    <a href="${link}">Validate your email: ${email}</a>
    `;

    const options = {
        to: email,
        subject:'Validate your email',
        htmlBody: html,
    }
    const isSet = await this.emailService.sendEmail(options)
    if(!isSet) throw CustomError.internalServer('Error sending email')
  }

  public validatedEmail = async(token:string) =>{
    const payload = await JwtAdapter.validateToken(token);
    if(!payload) throw CustomError.unauthorized('Invalid Token')

    const {email} = payload as {email: string};
    if(!email) throw CustomError.internalServer('Email not in token')

    const user = await UserModel.findOne({email});
    if(!user) throw CustomError.internalServer('Email not exist');

    user.emailValidated = true
    await user.save()

    return true

  }
}
