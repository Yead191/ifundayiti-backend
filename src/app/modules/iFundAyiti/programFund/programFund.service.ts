import { ProgramFund } from './programFund.model';



const getFundBalanceFromDB = async () => {
  const result = await ProgramFund.findOne({})
  return result
};

export const ProgramFundServices = {
  getFundBalanceFromDB,
};
