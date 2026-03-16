const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'studio',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const publicEventsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'PublicEvents');
}
publicEventsRef.operationName = 'PublicEvents';
exports.publicEventsRef = publicEventsRef;

exports.publicEvents = function publicEvents(dc) {
  return executeQuery(publicEventsRef(dc));
};

const myChildrenRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'MyChildren');
}
myChildrenRef.operationName = 'MyChildren';
exports.myChildrenRef = myChildrenRef;

exports.myChildren = function myChildren(dc) {
  return executeQuery(myChildrenRef(dc));
};

const registerChildForEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RegisterChildForEvent', inputVars);
}
registerChildForEventRef.operationName = 'RegisterChildForEvent';
exports.registerChildForEventRef = registerChildForEventRef;

exports.registerChildForEvent = function registerChildForEvent(dcOrVars, vars) {
  return executeMutation(registerChildForEventRef(dcOrVars, vars));
};

const updateMyDisplayNameRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMyDisplayName', inputVars);
}
updateMyDisplayNameRef.operationName = 'UpdateMyDisplayName';
exports.updateMyDisplayNameRef = updateMyDisplayNameRef;

exports.updateMyDisplayName = function updateMyDisplayName(dcOrVars, vars) {
  return executeMutation(updateMyDisplayNameRef(dcOrVars, vars));
};
