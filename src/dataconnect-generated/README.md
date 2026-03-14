# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*PublicEvents*](#publicevents)
  - [*MyChildren*](#mychildren)
- [**Mutations**](#mutations)
  - [*RegisterChildForEvent*](#registerchildforevent)
  - [*UpdateMyDisplayName*](#updatemydisplayname)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## PublicEvents
You can execute the `PublicEvents` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
publicEvents(): QueryPromise<PublicEventsData, undefined>;

interface PublicEventsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<PublicEventsData, undefined>;
}
export const publicEventsRef: PublicEventsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
publicEvents(dc: DataConnect): QueryPromise<PublicEventsData, undefined>;

interface PublicEventsRef {
  ...
  (dc: DataConnect): QueryRef<PublicEventsData, undefined>;
}
export const publicEventsRef: PublicEventsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the publicEventsRef:
```typescript
const name = publicEventsRef.operationName;
console.log(name);
```

### Variables
The `PublicEvents` query has no variables.
### Return Type
Recall that executing the `PublicEvents` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `PublicEventsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `PublicEvents`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, publicEvents } from '@dataconnect/generated';


// Call the `publicEvents()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await publicEvents();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await publicEvents(dataConnect);

console.log(data.events);

// Or, you can use the `Promise` API.
publicEvents().then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

### Using `PublicEvents`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, publicEventsRef } from '@dataconnect/generated';


// Call the `publicEventsRef()` function to get a reference to the query.
const ref = publicEventsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = publicEventsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.events);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

## MyChildren
You can execute the `MyChildren` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
myChildren(): QueryPromise<MyChildrenData, undefined>;

interface MyChildrenRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MyChildrenData, undefined>;
}
export const myChildrenRef: MyChildrenRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
myChildren(dc: DataConnect): QueryPromise<MyChildrenData, undefined>;

interface MyChildrenRef {
  ...
  (dc: DataConnect): QueryRef<MyChildrenData, undefined>;
}
export const myChildrenRef: MyChildrenRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the myChildrenRef:
```typescript
const name = myChildrenRef.operationName;
console.log(name);
```

### Variables
The `MyChildren` query has no variables.
### Return Type
Recall that executing the `MyChildren` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `MyChildrenData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `MyChildren`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, myChildren } from '@dataconnect/generated';


// Call the `myChildren()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await myChildren();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await myChildren(dataConnect);

console.log(data.children);

// Or, you can use the `Promise` API.
myChildren().then((response) => {
  const data = response.data;
  console.log(data.children);
});
```

### Using `MyChildren`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, myChildrenRef } from '@dataconnect/generated';


// Call the `myChildrenRef()` function to get a reference to the query.
const ref = myChildrenRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = myChildrenRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.children);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.children);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## RegisterChildForEvent
You can execute the `RegisterChildForEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
registerChildForEvent(vars: RegisterChildForEventVariables): MutationPromise<RegisterChildForEventData, RegisterChildForEventVariables>;

interface RegisterChildForEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: RegisterChildForEventVariables): MutationRef<RegisterChildForEventData, RegisterChildForEventVariables>;
}
export const registerChildForEventRef: RegisterChildForEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
registerChildForEvent(dc: DataConnect, vars: RegisterChildForEventVariables): MutationPromise<RegisterChildForEventData, RegisterChildForEventVariables>;

interface RegisterChildForEventRef {
  ...
  (dc: DataConnect, vars: RegisterChildForEventVariables): MutationRef<RegisterChildForEventData, RegisterChildForEventVariables>;
}
export const registerChildForEventRef: RegisterChildForEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the registerChildForEventRef:
```typescript
const name = registerChildForEventRef.operationName;
console.log(name);
```

### Variables
The `RegisterChildForEvent` mutation requires an argument of type `RegisterChildForEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface RegisterChildForEventVariables {
  childId: UUIDString;
  eventId: UUIDString;
}
```
### Return Type
Recall that executing the `RegisterChildForEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `RegisterChildForEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface RegisterChildForEventData {
  registration_insert: Registration_Key;
}
```
### Using `RegisterChildForEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, registerChildForEvent, RegisterChildForEventVariables } from '@dataconnect/generated';

// The `RegisterChildForEvent` mutation requires an argument of type `RegisterChildForEventVariables`:
const registerChildForEventVars: RegisterChildForEventVariables = {
  childId: ..., 
  eventId: ..., 
};

// Call the `registerChildForEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await registerChildForEvent(registerChildForEventVars);
// Variables can be defined inline as well.
const { data } = await registerChildForEvent({ childId: ..., eventId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await registerChildForEvent(dataConnect, registerChildForEventVars);

console.log(data.registration_insert);

// Or, you can use the `Promise` API.
registerChildForEvent(registerChildForEventVars).then((response) => {
  const data = response.data;
  console.log(data.registration_insert);
});
```

### Using `RegisterChildForEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, registerChildForEventRef, RegisterChildForEventVariables } from '@dataconnect/generated';

// The `RegisterChildForEvent` mutation requires an argument of type `RegisterChildForEventVariables`:
const registerChildForEventVars: RegisterChildForEventVariables = {
  childId: ..., 
  eventId: ..., 
};

// Call the `registerChildForEventRef()` function to get a reference to the mutation.
const ref = registerChildForEventRef(registerChildForEventVars);
// Variables can be defined inline as well.
const ref = registerChildForEventRef({ childId: ..., eventId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = registerChildForEventRef(dataConnect, registerChildForEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.registration_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.registration_insert);
});
```

## UpdateMyDisplayName
You can execute the `UpdateMyDisplayName` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateMyDisplayName(vars: UpdateMyDisplayNameVariables): MutationPromise<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;

interface UpdateMyDisplayNameRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMyDisplayNameVariables): MutationRef<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;
}
export const updateMyDisplayNameRef: UpdateMyDisplayNameRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateMyDisplayName(dc: DataConnect, vars: UpdateMyDisplayNameVariables): MutationPromise<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;

interface UpdateMyDisplayNameRef {
  ...
  (dc: DataConnect, vars: UpdateMyDisplayNameVariables): MutationRef<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;
}
export const updateMyDisplayNameRef: UpdateMyDisplayNameRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateMyDisplayNameRef:
```typescript
const name = updateMyDisplayNameRef.operationName;
console.log(name);
```

### Variables
The `UpdateMyDisplayName` mutation requires an argument of type `UpdateMyDisplayNameVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateMyDisplayNameVariables {
  newDisplayName: string;
}
```
### Return Type
Recall that executing the `UpdateMyDisplayName` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateMyDisplayNameData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateMyDisplayNameData {
  user_update?: User_Key | null;
}
```
### Using `UpdateMyDisplayName`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateMyDisplayName, UpdateMyDisplayNameVariables } from '@dataconnect/generated';

// The `UpdateMyDisplayName` mutation requires an argument of type `UpdateMyDisplayNameVariables`:
const updateMyDisplayNameVars: UpdateMyDisplayNameVariables = {
  newDisplayName: ..., 
};

// Call the `updateMyDisplayName()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateMyDisplayName(updateMyDisplayNameVars);
// Variables can be defined inline as well.
const { data } = await updateMyDisplayName({ newDisplayName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateMyDisplayName(dataConnect, updateMyDisplayNameVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updateMyDisplayName(updateMyDisplayNameVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdateMyDisplayName`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateMyDisplayNameRef, UpdateMyDisplayNameVariables } from '@dataconnect/generated';

// The `UpdateMyDisplayName` mutation requires an argument of type `UpdateMyDisplayNameVariables`:
const updateMyDisplayNameVars: UpdateMyDisplayNameVariables = {
  newDisplayName: ..., 
};

// Call the `updateMyDisplayNameRef()` function to get a reference to the mutation.
const ref = updateMyDisplayNameRef(updateMyDisplayNameVars);
// Variables can be defined inline as well.
const ref = updateMyDisplayNameRef({ newDisplayName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateMyDisplayNameRef(dataConnect, updateMyDisplayNameVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

