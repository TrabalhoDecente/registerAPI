import * as bcrypt from "bcrypt";
import axios from "axios";
import { Request, Response } from "express";
import * as jwt from "jwt-then";
import config from "../../config/config";
import User from "../users/user.model";
import UserGateway from "../users/userGateway.model";
import UserGatewayCredentials, {
  UserGatewayCredentialsInterface,
} from "../users/gatewayCredentials.model";

interface GatewayUser {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  redirectUri: string;
}
export default class UserController {
  public authenticate = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found",
        });
      }

      const matchPasswords = await bcrypt.compare(password, user.password);
      if (!matchPasswords) {
        return res.status(401).send({
          success: false,
          message: "Not authorized",
        });
      }

      const token = await jwt.sign({ email }, config.JWT_ENCRYPTION, {
        expiresIn: config.JWT_EXPIRATION,
      });

      res.status(200).send({
        success: true,
        message: "Token generated Successfully",
        data: token,
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.toString(),
      });
    }
  };

  public register = async (req: Request, res: Response): Promise<any> => {
    const { name, email, password } = req.body;
    try {
      const hash = await bcrypt.hash(password, config.SALT_ROUNDS);

      const user = new User({
        name,
        email,
        password: hash,
      });

      const newUser = await user.save();

      res.status(201).send({
        success: false,
        message: "User Successfully created",
        data: newUser,
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.toString(),
      });
    }
  };

  public getewayRegister = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    const { username, firstname, lastname, email, password } = req.body;
    console.log("Iniciando o registro do usuário");
    try {
      const hash = await bcrypt.hash(password, config.SALT_ROUNDS);

      const user = new User({
        username,
        firstname,
        lastname,
        email,
        password: hash,
      });
      const gatewayUserBody: GatewayUser = {
        username,
        firstname,
        lastname,
        email,
        redirectUri: "http://example.com",
      };

      const newUser = await user.save();
      if (newUser) {
        console.log("Usuário base salvo com sucesso.");
      }
      console.log("Iniciando processo de criação de usuário do gateway.");
      const response = await axios.post(
        "http://localhost:9876/users",
        gatewayUserBody
      );
      console.log(
        `Requisição feita para o endereço http://localhost:9876/users executada com status:${response.status} - Sucesso `
      );

      const userGateway = new UserGateway({
        username: response.data.username,
        id: response.data.id,
        email: response.data.email,
        firstname: response.data.firstname,
        lastname: response.data.lastname,
        isActive: response.data.isActive,
        redirectUri: response.data.redirectUri,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      });

      let gatewayUser = await userGateway.save();
      if (gatewayUser) {
        console.log("Usuário gateway salvo com sucesso.");
      }

      const userCredential: UserGatewayCredentialsInterface = {
        username: response.data.username,
        id: response.data.id,
        email: response.data.email,
        secret: "",
        isActive: false,
        createdAt: "",
        updatedAt: "",
      };
      console.log(
        `Iniciando processo de credencial para o usuário do gateway.`
      );

      const res2 = await axios.post("http://localhost:9876/credentials", {
        credential: {},
        consumerId: response.data.username,
        type: "oauth2",
      });
      if (res2) {
        console.log(
          `Requisição feita para o endereço http://localhost:9876/credentials executada com status:${res2.status} - Sucesso `
        );
        console.log("Credêncial gateway criada com sucesso.");
      }

      userCredential.secret = res2.data.secret;
      userCredential.isActive = res2.data.isActive;
      userCredential.createdAt = res2.data.createdAt;
      userCredential.updatedAt = res2.data.updatedAt;

      const userCredentialSave = new UserGatewayCredentials({
        ...userCredential,
      });

      // Salva no banco o meu user com email e username do registerAPi, e coloca todos os dados recebido pela credential.
      let userCredentialGateway = await userCredentialSave.save();
      if (userCredentialGateway) {
        console.log("Credêncial gateway salva no banco Mongo com sucesso.");
      }

      // Como res envio somente o que importaa para o front que não tem visibilidade do que acontece no gateway
      res.status(201).send({
        success: true,
        message: "User Successfully created",
        data: newUser,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        success: false,
        message: err.toString(),
      });
    }
  };
}
