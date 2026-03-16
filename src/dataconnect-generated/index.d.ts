import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Assignment_Key {
  volunteerId: UUIDString;
  eventId: UUIDString;
  __typename?: 'Assignment_Key';
}

export interface Attendance_Key {
  childId: UUIDString;
  eventId: UUIDString;
  __typename?: 'Attendance_Key';
}

export interface Child_Key {
  id: UUIDString;
  __typename?: 'Child_Key';
}

export interface Event_Key {
  id: UUIDString;
  __typename?: 'Event_Key';
}

export interface MyChildrenData {
  children: ({
    id: UUIDString;
    firstName: string;
    lastName: string;
    dateOfBirth: DateString;
    medicalNotes?: string | null;
    allergies?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
  } & Child_Key)[];
}

export interface PublicEventsData {
  events: ({
    id: UUIDString;
    name: string;
    date: DateString;
    startTime: string;
    endTime: string;
    ageGroupMin: number;
    ageGroupMax: number;
    location?: string | null;
    description?: string | null;
  } & Event_Key)[];
}

export interface RegisterChildForEventData {
  registration_insert: Registration_Key;
}

export interface RegisterChildForEventVariables {
  childId: UUIDString;
  eventId: UUIDString;
}

export interface Registration_Key {
  childId: UUIDString;
  eventId: UUIDString;
  __typename?: 'Registration_Key';
}

export interface UpdateMyDisplayNameData {
  user_update?: User_Key | null;
}

export interface UpdateMyDisplayNameVariables {
  newDisplayName: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface PublicEventsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<PublicEventsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<PublicEventsData, undefined>;
  operationName: string;
}
export const publicEventsRef: PublicEventsRef;

export function publicEvents(): QueryPromise<PublicEventsData, undefined>;
export function publicEvents(dc: DataConnect): QueryPromise<PublicEventsData, undefined>;

interface MyChildrenRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MyChildrenData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<MyChildrenData, undefined>;
  operationName: string;
}
export const myChildrenRef: MyChildrenRef;

export function myChildren(): QueryPromise<MyChildrenData, undefined>;
export function myChildren(dc: DataConnect): QueryPromise<MyChildrenData, undefined>;

interface RegisterChildForEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RegisterChildForEventVariables): MutationRef<RegisterChildForEventData, RegisterChildForEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RegisterChildForEventVariables): MutationRef<RegisterChildForEventData, RegisterChildForEventVariables>;
  operationName: string;
}
export const registerChildForEventRef: RegisterChildForEventRef;

export function registerChildForEvent(vars: RegisterChildForEventVariables): MutationPromise<RegisterChildForEventData, RegisterChildForEventVariables>;
export function registerChildForEvent(dc: DataConnect, vars: RegisterChildForEventVariables): MutationPromise<RegisterChildForEventData, RegisterChildForEventVariables>;

interface UpdateMyDisplayNameRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMyDisplayNameVariables): MutationRef<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateMyDisplayNameVariables): MutationRef<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;
  operationName: string;
}
export const updateMyDisplayNameRef: UpdateMyDisplayNameRef;

export function updateMyDisplayName(vars: UpdateMyDisplayNameVariables): MutationPromise<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;
export function updateMyDisplayName(dc: DataConnect, vars: UpdateMyDisplayNameVariables): MutationPromise<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;

