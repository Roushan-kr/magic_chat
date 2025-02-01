import { sendVerifyMail } from "@/helpers/sendEmailVerifcation";
import dbConnect from "@/lib/dbconnect";
import userModel from "@/models/User";
import { signUpSchema } from "@/schemas/signUpSchema";
import bcrypt from "bcrypt";


export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, email, password } = signUpSchema.parse(await req.json() || {});

    // Check if user exists in the database and is verified
    const isVerifiedUserWithUsernameExists = await userModel.findOne({
      uname: username,
      isVerified: true,
    });

    if (isVerifiedUserWithUsernameExists) {
      return Response.json(
        { success: false, message: "User with this username already exists" },
        { status: 400 }
      );
    }

    const isUerExistsWithEmail = await userModel.findOne({ email });

    if (isUerExistsWithEmail) {
        if (isUerExistsWithEmail.isVerified) {
          return Response.json(
            { success: false, message: "User with this email already exists" },
            { status: 400 }
          );
        }
        // if user is not verified then send verification code again

        // sand email verification code with 10 min expiry without updating passwd
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        isUerExistsWithEmail.verifyCode = newCode;
        isUerExistsWithEmail.verifyCodeExpires = new Date(Date.now() + 600000);
        await isUerExistsWithEmail.save();

        const { success, message, error } = await sendVerifyMail({
          username: isUerExistsWithEmail.uname,
          email,
          verifyCode: isUerExistsWithEmail.verifyCode,
        });
        
        return Response.json({success, message, error}, {status: 201}); 
    } else {
      const hashPasswd = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = new userModel({
        uname: username,
        email,
        password: hashPasswd,
        verifyCode: Math.floor(100000 + Math.random() * 900000).toString(),
        verifyCodeExpires: Date.now() + 600000,
      },{ new: true });

      await newUser.save();

      // sand email verification code with 10 min expiry
      const { success, message, error } = await sendVerifyMail({
        username,
        email,
        verifyCode: newUser.verifyCode,
      });

      if (!success) {
        return Response.json(
          { success: false, message, error },
          { status: 500 }
        );
      }
    }

    return Response.json(
      { success: true, message: "User created successfully Please Verify Your Mail" },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    Response.json(
      { success: false, message: "Error signing in user", error },
      { status: 500 }
    );
  }
}
