import apiClient from "./api.client";
import type {
    AwardedContractsQuery,
    ContractorsQuery,
    InstitutionsQuery,
    RealisedContractsQuery,
} from "./types/contracts/Query.types";
import type {
    AwardedContractItem,
    ChangesInAwardedContractItem,
    ContractorDetails,
    ContractorItem,
    InstitutionDetails,
    InstitutionItem,
    RealisedContractItem,
    ReferenceDataResponse,
    StatsResponse,
} from "./types/contracts/Response.types";
import type { PaginatedList } from "./types/shared/PaginationResponse.type";
import { cleanParams } from "./util/paramsCleaner";

const contractsService = {
    stats: {
        async getStatistics(): Promise<StatsResponse> {
            const response =
                await apiClient.get<StatsResponse>("contracts/stats");
            return response.data;
        },
    },

    reference: {
        async getReferenceData(): Promise<ReferenceDataResponse> {
            const response = await apiClient.get<ReferenceDataResponse>(
                "contracts/reference",
            );
            return response.data;
        },
    },

    contractors: {
        async getContractors(
            query: ContractorsQuery,
        ): Promise<PaginatedList<ContractorItem>> {
            const response = await apiClient.get<PaginatedList<ContractorItem>>(
                "contracts/contractors",
                {
                    params: cleanParams({
                        name: query.name,
                        sortBy: query.sortBy,
                        sortDirection: query.sortDirection,
                        cursor: query.cursor,
                        pageSize: query.pageSize,
                    }),
                },
            );

            return response.data;
        },

        async getContractorDetails(
            id: number,
            contractsPageSize: number,
        ): Promise<{
            contractorInfo: { data: ContractorDetails };
            contractorAwardedContracts: PaginatedList<AwardedContractItem>;
            contractorRealisedContracts: PaginatedList<RealisedContractItem>;
        }> {
            const [
                contractorInfoResponse,
                contractorAwardedContractsResponse,
                contractorRealisedContractsResponse,
            ] = await Promise.all([
                apiClient.get<{ data: ContractorDetails }>(
                    `contracts/contractors/${id}`,
                ),
                apiClient.get<PaginatedList<AwardedContractItem>>(
                    `contracts/contractors/${id}/awarded`,
                    {
                        params: { pageSize: contractsPageSize },
                    },
                ),
                apiClient.get<PaginatedList<RealisedContractItem>>(
                    `contracts/contractors/${id}/realised`,
                    {
                        params: { pageSize: contractsPageSize },
                    },
                ),
            ]);

            return {
                contractorInfo: contractorInfoResponse.data,
                contractorAwardedContracts:
                    contractorAwardedContractsResponse.data,
                contractorRealisedContracts:
                    contractorRealisedContractsResponse.data,
            };
        },
    },

    institutions: {
        async getInstitutions(
            query: InstitutionsQuery,
        ): Promise<PaginatedList<InstitutionItem>> {
            const response = await apiClient.get<
                PaginatedList<InstitutionItem>
            >("contracts/institutions", {
                params: cleanParams({
                    name: query.name,
                    sortBy: query.sortBy,
                    sortDirection: query.sortDirection,
                    cursor: query.cursor,
                    pageSize: query.pageSize,
                }),
            });

            return response.data;
        },

        async getInstitutionDetails(
            id: number,
            contractsPageSize: number,
        ): Promise<{
            institutionInfo: { data: InstitutionDetails };
            institutionAwardedContracts: PaginatedList<AwardedContractItem>;
            institutionRealisedContracts: PaginatedList<RealisedContractItem>;
        }> {
            const [
                institutionInfoResponse,
                institutionAwardedContractsResponse,
                institutionRealisedContractsResponse,
            ] = await Promise.all([
                apiClient.get<{ data: InstitutionDetails }>(
                    `contracts/institutions/${id}`,
                ),
                apiClient.get<PaginatedList<AwardedContractItem>>(
                    `contracts/institutions/${id}/awarded`,
                    {
                        params: { pageSize: contractsPageSize },
                    },
                ),
                apiClient.get<PaginatedList<RealisedContractItem>>(
                    `contracts/institutions/${id}/realised`,
                    {
                        params: { pageSize: contractsPageSize },
                    },
                ),
            ]);

            return {
                institutionInfo: institutionInfoResponse.data,
                institutionAwardedContracts:
                    institutionAwardedContractsResponse.data,
                institutionRealisedContracts:
                    institutionRealisedContractsResponse.data,
            };
        },
    },

    awarded: {
        async getAwardedContracts(
            query: AwardedContractsQuery,
        ): Promise<PaginatedList<AwardedContractItem>> {
            const response = await apiClient.get<
                PaginatedList<AwardedContractItem>
            >("contracts/awarded", {
                params: cleanParams({
                    numChanges: query.numChanges,
                    institutionId: query.institutionId,
                    institution: query.institution,
                    contractorId: query.contractorId,
                    contractor: query.contractor,
                    smallContract: query.smallContract,
                    subject: query.subject,
                    typeContractId: query.typeContractId,
                    typeProcedureId: query.typeProcedureId,
                    typeOfferId: query.typeOfferId,
                    typeFrameworkAgreementId: query.typeFrameworkAgreementId,
                    lessThanEstimatedValue: query.lessThanEstimatedValue,
                    moreThanEstimatedValue: query.moreThanEstimatedValue,
                    lessThanAssignedValue: query.lessThanAssignedValue,
                    moreThanAssignedValue: query.moreThanAssignedValue,
                    afterPostDate: query.afterPostDate,
                    beforePostDate: query.beforePostDate,
                    sortBy: query.sortBy,
                    sortDirection: query.sortDirection,
                    cursor: query.cursor,
                    pageSize: query.pageSize,
                }),
            });

            return response.data;
        },

        async getAwardedContractDetails(
            id: number,
        ): Promise<{ data: AwardedContractItem }> {
            const response = await apiClient.get<{ data: AwardedContractItem }>(
                `contracts/awarded/${id}`,
            );

            return response.data;
        },

        async getAwardedContractChanges(
            id: number,
        ): Promise<{ data: ChangesInAwardedContractItem[] }> {
            const response = await apiClient.get<{
                data: ChangesInAwardedContractItem[];
            }>(`contracts/awarded/${id}/changes`);

            return response.data;
        },
    },

    realised: {
        async getRealisedContracts(
            query: RealisedContractsQuery,
        ): Promise<PaginatedList<RealisedContractItem>> {
            const response = await apiClient.get<
                PaginatedList<RealisedContractItem>
            >("contracts/realised", {
                params: cleanParams({
                    institutionId: query.institutionId,
                    institution: query.institution,
                    contractorId: query.contractorId,
                    contractor: query.contractor,
                    subject: query.subject,
                    typeContractId: query.typeContractId,
                    typeProcedureId: query.typeProcedureId,
                    typeOfferId: query.typeOfferId,
                    typeFrameworkAgreementId: query.typeFrameworkAgreementId,
                    lessThanAssignedValue: query.lessThanAssignedValue,
                    moreThanAssignedValue: query.moreThanAssignedValue,
                    lessThanRealisedValue: query.lessThanRealisedValue,
                    moreThanRealisedValue: query.moreThanRealisedValue,
                    lessThanPaidValue: query.lessThanPaidValue,
                    moreThanPaidValue: query.moreThanPaidValue,
                    afterPostDate: query.afterPostDate,
                    beforePostDate: query.beforePostDate,
                    sortBy: query.sortBy,
                    sortDirection: query.sortDirection,
                    cursor: query.cursor,
                    pageSize: query.pageSize,
                }),
            });

            return response.data;
        },

        async getRealisedContractDetails(
            id: number,
        ): Promise<{ data: RealisedContractItem }> {
            const response = await apiClient.get<{
                data: RealisedContractItem;
            }>(`contracts/realised/${id}`);

            return response.data;
        },
    },
};

export default contractsService;
