import { Request, Response } from "express";
import { registerSchema, loginSchema } from "../validation/authvalidation";
import { UserRole } from "../../domain/refined/userRefined";
import container from "../../lib/di/bindings";
import { UserService } from "../../application/services/userService";
import { handleResponse } from "../../utils/handleResponse";
import {
  DeleteUserDTO,
  LoginDTO,
  UserRegisterDTO,
} from "../../application/DTOs/request/userDto";
import { UUIDDTO } from "../../application/DTOs/request/commonDTO";
import { PaginationDTO } from "../../application/DTOs/request/paginationdto";

class UserController {
  private static userService = container.resolve<UserService>("UserService");

  static registerUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    const registerUserDTO = UserRegisterDTO.create({
      ...req.body,
      role: UserRole.from("User"),
    }).unwrap();

    const result = await this.userService.registerUser(registerUserDTO);

    handleResponse(result, res, 201);
  };

  static loginUser = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const loginUserDTO = LoginDTO.create({
      ...req.body,
    }).unwrap();
    const result = await this.userService.loginUser(loginUserDTO);
    console.log(`Logging in user with name ${result.unwrap()}`);
    handleResponse(result, res, 200);
  };

  static updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateUserDTO = UUIDDTO.create(req.params.id).unwrap();
    const result = await this.userService.updateUser(updateUserDTO);
    handleResponse(result, res, 200);
  };
  static async getPaginatedUsers(req: Request, res: Response): Promise<void> {
    const paginationDTO = PaginationDTO.create(req.query).unwrap();

    const result = await this.userService.getPaginatedUsers(paginationDTO);

    handleResponse(result, res, 200);
  }

  static deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleteUserDTO = DeleteUserDTO.create(req.params.id).unwrap();

    const result = await this.userService.deleteUser(deleteUserDTO);
    handleResponse(result, res, 204);
  };
}

export default UserController;
