import { useScaffoldReadContract } from "./useScaffoldReadContract";

/**
 * Custom hook to read all lease data for a landlord
 * Eliminates duplication by abstracting multiple contract reads
 */
export function useLandlordLeases(landlordAddress: string | undefined) {
  // Get landlord's lease IDs
  const { data: landlordLeaseIds } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "getLandlordLeases",
    args: [landlordAddress],
  });

  // Read lease data for up to 10 leases
  const { data: leaseData0 } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "leases",
    args: [landlordLeaseIds?.[0]],
  });

  const { data: leaseData1 } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "leases",
    args: [landlordLeaseIds?.[1]],
  });

  const { data: leaseData2 } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "leases",
    args: [landlordLeaseIds?.[2]],
  });

  const { data: leaseData3 } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "leases",
    args: [landlordLeaseIds?.[3]],
  });

  const { data: leaseData4 } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "leases",
    args: [landlordLeaseIds?.[4]],
  });

  const { data: leaseData5 } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "leases",
    args: [landlordLeaseIds?.[5]],
  });

  const { data: leaseData6 } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "leases",
    args: [landlordLeaseIds?.[6]],
  });

  const { data: leaseData7 } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "leases",
    args: [landlordLeaseIds?.[7]],
  });

  const { data: leaseData8 } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "leases",
    args: [landlordLeaseIds?.[8]],
  });

  const { data: leaseData9 } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "leases",
    args: [landlordLeaseIds?.[9]],
  });

  // Read deposits for each lease
  const { data: leaseDeposit0 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseDeposits",
    args: [landlordLeaseIds?.[0]],
  });

  const { data: leaseDeposit1 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseDeposits",
    args: [landlordLeaseIds?.[1]],
  });

  const { data: leaseDeposit2 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseDeposits",
    args: [landlordLeaseIds?.[2]],
  });

  const { data: leaseDeposit3 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseDeposits",
    args: [landlordLeaseIds?.[3]],
  });

  const { data: leaseDeposit4 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseDeposits",
    args: [landlordLeaseIds?.[4]],
  });

  const { data: leaseDeposit5 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseDeposits",
    args: [landlordLeaseIds?.[5]],
  });

  const { data: leaseDeposit6 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseDeposits",
    args: [landlordLeaseIds?.[6]],
  });

  const { data: leaseDeposit7 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseDeposits",
    args: [landlordLeaseIds?.[7]],
  });

  const { data: leaseDeposit8 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseDeposits",
    args: [landlordLeaseIds?.[8]],
  });

  const { data: leaseDeposit9 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseDeposits",
    args: [landlordLeaseIds?.[9]],
  });

  // Read yield for each lease
  const { data: leaseYield0 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseYield",
    args: [landlordLeaseIds?.[0]],
  });

  const { data: leaseYield1 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseYield",
    args: [landlordLeaseIds?.[1]],
  });

  const { data: leaseYield2 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseYield",
    args: [landlordLeaseIds?.[2]],
  });

  const { data: leaseYield3 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseYield",
    args: [landlordLeaseIds?.[3]],
  });

  const { data: leaseYield4 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseYield",
    args: [landlordLeaseIds?.[4]],
  });

  const { data: leaseYield5 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseYield",
    args: [landlordLeaseIds?.[5]],
  });

  const { data: leaseYield6 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseYield",
    args: [landlordLeaseIds?.[6]],
  });

  const { data: leaseYield7 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseYield",
    args: [landlordLeaseIds?.[7]],
  });

  const { data: leaseYield8 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseYield",
    args: [landlordLeaseIds?.[8]],
  });

  const { data: leaseYield9 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseYield",
    args: [landlordLeaseIds?.[9]],
  });

  // Read payment history for each lease
  const { data: paymentHistory0 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[0]],
    watch: true,
  });

  const { data: paymentHistory1 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[1]],
    watch: true,
  });

  const { data: paymentHistory2 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[2]],
    watch: true,
  });

  const { data: paymentHistory3 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[3]],
    watch: true,
  });

  const { data: paymentHistory4 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[4]],
    watch: true,
  });

  const { data: paymentHistory5 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[5]],
    watch: true,
  });

  const { data: paymentHistory6 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[6]],
    watch: true,
  });

  const { data: paymentHistory7 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[7]],
    watch: true,
  });

  const { data: paymentHistory8 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[8]],
    watch: true,
  });

  const { data: paymentHistory9 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[9]],
    watch: true,
  });

  // Transform raw lease data into structured objects
  const transformLeaseData = (leaseData: any) => {
    if (!leaseData) return undefined;
    return {
      tenant: leaseData[1] as string,
      landlord: leaseData[2] as string,
      monthlyRent: leaseData[3] as bigint,
      dueDay: leaseData[4] as bigint,
      startDate: leaseData[5] as bigint,
      endDate: leaseData[6] as bigint,
      status: leaseData[7] as number,
      paymentCount: leaseData[8] as bigint,
      totalPaid: leaseData[9] as bigint,
    };
  };

  // Create array of all leases with their data
  const allLeases = [
    leaseData0,
    leaseData1,
    leaseData2,
    leaseData3,
    leaseData4,
    leaseData5,
    leaseData6,
    leaseData7,
    leaseData8,
    leaseData9,
  ]
    .map(transformLeaseData)
    .filter(lease => lease !== undefined);

  // Create array of lease IDs with their deposits and yields
  const leasesWithFinancials =
    landlordLeaseIds?.map((leaseId, index) => {
      const deposits = [
        leaseDeposit0,
        leaseDeposit1,
        leaseDeposit2,
        leaseDeposit3,
        leaseDeposit4,
        leaseDeposit5,
        leaseDeposit6,
        leaseDeposit7,
        leaseDeposit8,
        leaseDeposit9,
      ];
      const yields = [
        leaseYield0,
        leaseYield1,
        leaseYield2,
        leaseYield3,
        leaseYield4,
        leaseYield5,
        leaseYield6,
        leaseYield7,
        leaseYield8,
        leaseYield9,
      ];

      return {
        leaseId,
        deposit: deposits[index] || 0n,
        yield: yields[index] || 0n,
      };
    }) || [];

  // Combine all payment histories
  const allPaymentHistory = [
    ...(paymentHistory0 || []),
    ...(paymentHistory1 || []),
    ...(paymentHistory2 || []),
    ...(paymentHistory3 || []),
    ...(paymentHistory4 || []),
    ...(paymentHistory5 || []),
    ...(paymentHistory6 || []),
    ...(paymentHistory7 || []),
    ...(paymentHistory8 || []),
    ...(paymentHistory9 || []),
  ].sort((a: any, b: any) => {
    return Number(b.paidDate || 0n) - Number(a.paidDate || 0n);
  });

  // Calculate totals
  const totalMonthlyRent = allLeases.reduce((sum, lease) => sum + (lease?.monthlyRent || 0n), 0n);
  const totalSecurityDeposits = leasesWithFinancials.reduce((sum, lease) => sum + lease.deposit, 0n);
  const totalYieldEarned = leasesWithFinancials.reduce((sum, lease) => sum + lease.yield, 0n);

  return {
    landlordLeaseIds,
    allLeases,
    leasesWithFinancials,
    allPaymentHistory,
    totalProperties: landlordLeaseIds?.length || 0,
    totalMonthlyRent,
    totalSecurityDeposits,
    totalYieldEarned,
  };
}
