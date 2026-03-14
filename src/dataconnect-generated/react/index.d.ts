import { PublicEventsData, MyChildrenData, RegisterChildForEventData, RegisterChildForEventVariables, UpdateMyDisplayNameData, UpdateMyDisplayNameVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function usePublicEvents(options?: useDataConnectQueryOptions<PublicEventsData>): UseDataConnectQueryResult<PublicEventsData, undefined>;
export function usePublicEvents(dc: DataConnect, options?: useDataConnectQueryOptions<PublicEventsData>): UseDataConnectQueryResult<PublicEventsData, undefined>;

export function useMyChildren(options?: useDataConnectQueryOptions<MyChildrenData>): UseDataConnectQueryResult<MyChildrenData, undefined>;
export function useMyChildren(dc: DataConnect, options?: useDataConnectQueryOptions<MyChildrenData>): UseDataConnectQueryResult<MyChildrenData, undefined>;

export function useRegisterChildForEvent(options?: useDataConnectMutationOptions<RegisterChildForEventData, FirebaseError, RegisterChildForEventVariables>): UseDataConnectMutationResult<RegisterChildForEventData, RegisterChildForEventVariables>;
export function useRegisterChildForEvent(dc: DataConnect, options?: useDataConnectMutationOptions<RegisterChildForEventData, FirebaseError, RegisterChildForEventVariables>): UseDataConnectMutationResult<RegisterChildForEventData, RegisterChildForEventVariables>;

export function useUpdateMyDisplayName(options?: useDataConnectMutationOptions<UpdateMyDisplayNameData, FirebaseError, UpdateMyDisplayNameVariables>): UseDataConnectMutationResult<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;
export function useUpdateMyDisplayName(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateMyDisplayNameData, FirebaseError, UpdateMyDisplayNameVariables>): UseDataConnectMutationResult<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;
