import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'studio',
  location: 'us-east4'
};

export const publicEventsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'PublicEvents');
}
publicEventsRef.operationName = 'PublicEvents';

export function publicEvents(dc) {
  return executeQuery(publicEventsRef(dc));
}

export const myChildrenRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'MyChildren');
}
myChildrenRef.operationName = 'MyChildren';

export function myChildren(dc) {
  return executeQuery(myChildrenRef(dc));
}

export const registerChildForEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RegisterChildForEvent', inputVars);
}
registerChildForEventRef.operationName = 'RegisterChildForEvent';

export function registerChildForEvent(dcOrVars, vars) {
  return executeMutation(registerChildForEventRef(dcOrVars, vars));
}

export const updateMyDisplayNameRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMyDisplayName', inputVars);
}
updateMyDisplayNameRef.operationName = 'UpdateMyDisplayName';

export function updateMyDisplayName(dcOrVars, vars) {
  return executeMutation(updateMyDisplayNameRef(dcOrVars, vars));
}

