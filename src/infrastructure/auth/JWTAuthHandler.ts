import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { IAuthHandler } from "../auth/IAuthHandler";
import { IUserRepository } from "../../domain/interfaces/IUserRepository";
import config from "../../utils/config";
import { IncorrectUserNameOrPassword } from "../../domain/errors/userErrors";
import { Result } from "@carbonteq/fp";
import { AppResult } from "@carbonteq/hexapp";

const JWT_SECRET = config.jwtSecret;

export class JwtAuthHandler implements IAuthHandler {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }
  async login(username: string, password: string): Promise<string> {
    // Fetch the user by username
    const userResult = await this.userRepository.fetchByUsername(username);

    // Check if the user was found and if the password matches
    const passwordResult = await userResult.flatMap(async (user) => {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return Result.Err(new IncorrectUserNameOrPassword());
      }
      return Result.Ok(user); 

    });
     const tokenResult = passwordResult.map((user)=>{
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      return token;
    });
    return tokenResult.unwrapOr("");
  }

  async verify(token: string): Promise<boolean> {
    try {
      jwt.verify(token, JWT_SECRET);
      return true;
    } catch {
      return false;
    }
  }

  async decode(
    token: string
  ): Promise<{ id: string; username: string; role: string }> {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
      role: string;
    };
    return decoded;
  }
}
