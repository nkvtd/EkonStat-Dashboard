export type ReferenceDataResponse = {
    procedureTypes: Record<string, string>;
    offerTypes: Record<string, string>;
    frameworkAgreementTypes: Record<string, string>;
    changeReasonTypes: Record<string, string>;
};

export type StatsResponse = {
    awardedContractsCount: number;
    realisedContractsCount: number;
    totalContractsCount: number;
    institutionsCount: number;
    contractorsCount: number;
};

export type InstitutionItem = {
    id: number;
    name: string;
    awardedContractsCount: number;
    realisedContractsCount: number;
    spendings: number;
};

export type ContractorItem = {
    id: number;
    name: string;
    awardedContractsCount: number;
    realisedContractsCount: number;
    earnings: number;
};

export type InstitutionDetails = {
    id: number;
    name: string;
    awardedContractsCount: number;
    realisedContractsCount: number;
    spendings: number;
};

export type ContractorDetails = {
    id: number;
    name: string;
    awardedContractsCount: number;
    realisedContractsCount: number;
    earnings: number;
};

export type AwardedContractItem = {
    id: number;
    processNumber: string;
    numChanges: number;
    institution: { id: number; name: string };
    contractor: { id: number; name: string };
    smallContract: boolean;
    subject: string;
    contractType: { id: number; name: string };
    procedureType: { id: number; name: string };
    offerType: { id: number; name: string };
    frameworkAgreementType: { id: number; name: string } | null;
    estimatedContractValue: number;
    originalContractValue: number;
    assignedContractValue: number;
    postDate: string | null;
};

export type ChangesInAwardedContractItem = {
    id: number;
    processNumber: string;
    institution: {
        id: number;
        name: string;
    };
    contractor: {
        id: number;
        name: string;
    };
    subject: string;
    changeReason: {
        id: number;
        name: string;
    };
    assignedContractValue: number;
    updatedContractValue: number;
    differenceInValue: number;
    changeDate: string;
};

export type RealisedContractItem = {
    id: number;
    processNumber: string;
    institution: { id: number; name: string };
    contractor: { id: number; name: string };
    subject: string;
    contractType: { id: number; name: string };
    procedureType: { id: number; name: string };
    offerType: { id: number; name: string };
    frameworkAgreementType: { id: number; name: string } | null;
    assignedContractValue: number;
    realisedContractValue: number;
    paidContractValue: number;
    postDate: string | null;
};
