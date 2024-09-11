export const getVerificationCode = () => {
    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    return verificationCode.toString();
}