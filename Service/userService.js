import { User } from "../Models/userSchema.js";
import { OtpModel } from "../Models/otpSchema.js";
import hash from "../helpers/passwordHash.js";
import { categoryModel } from "../Models/categorySchema.js";
import helpers from "../helpers/helpers.js";

const findUserFromDB = async (email) => {
  return await User.findOne({ email: email, deleted: false, isBlocked: false });
};

const storeOtpInDb = async (email, otp) => {
  const data = await OtpModel.create({ email: email, otp: otp });
};

const checkOtp = async (otp, email) => {
  const data = await OtpModel.findOne({
    email,
    expiresAt: { $gte: new Date() },
  });
  if (data?.expiresAt.getTime() <= Date.now()) return false;
  console.log(otp, data?.otp);
  if (otp == data?.otp) {
    console.log(data.expiresAt, new Date());
    await OtpModel.findOneAndDelete({ email });
    return true;
  }
  return false;
};

const storeUserData = async (
  otp,
  userName,
  email,
  password,
  phoneNumber,
  referralCode,
  referralId,
  role,
) => {
  const passwordHashed = hash.passwordHash(password);
  return await User.create({
    userName,
    email,
    password: passwordHashed,
    phoneNumber,
    referralCode,
    referralId,
    role,
    isBlocked: false,
    createdAt: new Date(),
    deleted: false,
  });
};

const clearOtp = async (email) => {
  try {
    await OtpModel.deleteMany({ email });
  } catch (error) {
    console.log("error from deleting exeisting otps");
  }
};
const getAllCategory = async () => {
  return await categoryModel.find({ isBlocked: false });
};
const updatePassword = async (password, email) => {
  const passwordHashed = hash.passwordHash(password);
  await User.findOneAndUpdate(
    { email },
    { $set: { password: passwordHashed } },
  );
};

const verifyData = async (session, userName, email, phoneNumber, image) => {
  let flag = false;
  if (session.userName !== userName) {
    session.newUserName = userName;
  }

  if (phoneNumber && phoneNumber !== session.phoneNumber) {
    session.newPhoneNumber = phoneNumber;
  }

  console.log("this is image", image);

  if (image) {
    session.newImageId = image.filename;
    session.newImageUrl = image.path;
  }

  if (email !== session.email) {
    if (!(await User.findOne({ email: email }))) {
      flag = true;
      session.newEmail = email;
    } else {
      return "error";
    }
  }
  return flag;
};

const updateUserData = async (req) => {
  let data = {};
  let profile;
  if (req.session.newEmail) {
    data.email = req.session.newEmail;
  }

  if (req.session.newPhoneNumber) {
    data.phoneNumber = req.session.newPhoneNumber;
  }
  console.log("this is new image", req.session.newImageUrl);
  if (req.session?.newImageUrl) {
    data.profile = {};
    data.profile.publicId = req.session.newImageId;
    data.profile.url = req.session.newImageUrl;
    profile = await User.findOne(
      { email: req.session.email },
      { _id: 0, profile: 1 },
    );
  }
  if (req.session.newUserName) {
    data.userName = req.session.newUserName;
  }
  delete req.session?.newEmail;
  delete req.session?.newUserName;
  delete req.session?.newPhoneNumber;
  delete req.session?.newImageUrl;
  delete req.session?.newImageId;
  data = await User.findOneAndUpdate(
    { email: req.session.email },
    { $set: data },
    { new: true },
  );
  if (profile?.publicId) {
    await helpers.deleteProfile(profile.profile);
  }
  req.session.userName = data.userName;
  req.session.email = data.email;
  req.session.phoneNumber = data.phoneNumber;
  req.session.profile = data.profile.url;
};

const getCorrentPassword = async (email) => {
  const { password } = await User.findOne(
    { email: email },
    { _id: 0, password: 1 },
  );
  return password;
};

const findReferralUser = async (referralCode) => {
  return await User.findOne({ referralId: referralCode });
};

export default {
  findUserFromDB,
  storeOtpInDb,
  storeUserData,
  checkOtp,
  clearOtp,
  getAllCategory,
  updatePassword,
  verifyData,
  updateUserData,
  getCorrentPassword,
  findReferralUser,
};
