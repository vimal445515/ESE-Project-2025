export const generateReferralCode = (userName) =>
{
    return `${userName}${new Date().getTime()}${Math.floor(Math.random(1,1000)*1000)}`
}

