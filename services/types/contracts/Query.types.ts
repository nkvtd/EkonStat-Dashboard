import { PaginationQuery } from "../shared/PaginationQuery.type";

export type ContractorsQuery = PaginationQuery & {
    name?: string;
};

export type InstitutionsQuery = PaginationQuery & {
    name?: string;
};

export type AwardedContractsQuery = PaginationQuery & {
    numChanges?: number;
    institutionId?: number;
    institution?: string;
    contractorId?: number;
    contractor?: string;
    smallContract?: boolean;
    subject?: string;
    typeContractId?: number;
    typeProcedureId?: number;
    typeOfferId?: number;
    typeFrameworkAgreementId?: number;
    lessThanEstimatedValue?: number;
    moreThanEstimatedValue?: number;
    lessThanAssignedValue?: number;
    moreThanAssignedValue?: number;
    afterPostDate?: string;
    beforePostDate?: string;
};

export type RealisedContractsQuery = PaginationQuery & {
    institutionId?: number;
    institution?: string;
    contractorId?: number;
    contractor?: string;
    subject?: string;
    typeContractId?: number;
    typeProcedureId?: number;
    typeOfferId?: number;
    typeFrameworkAgreementId?: number;
    lessThanAssignedValue?: number;
    moreThanAssignedValue?: number;
    lessThanRealisedValue?: number;
    moreThanRealisedValue?: number;
    lessThanPaidValue?: number;
    moreThanPaidValue?: number;
    afterPostDate?: string;
    beforePostDate?: string;
};
