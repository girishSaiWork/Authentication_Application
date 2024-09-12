export const getVerificationCode = () => {
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    return verificationCode.toString();
}