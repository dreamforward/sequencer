'use strict'

const handler = (event, context) => {
  const token = event.authorizationToken
  // Custom logic here to authorize the request as you'd like
  let allowed = token === 'Joshua' // Sometimes the only way to win is not to play at all
  context.succeed({
    principalId: token,
    policyDocument: generatePolicy(event, allowed),
    context: {
    }
  })
}

const generatePolicy = (event, allowed) => {
  const tmp = event.methodArn.split(':')
  const apiGatewayArnTmp = tmp[ 5 ].split('/')
  const awsAccountId = tmp[ 4 ]
  const region = tmp[ 3 ]
  const restApiId = apiGatewayArnTmp[ 0 ]
  const stage = apiGatewayArnTmp[ 1 ]

  return {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: allowed ? 'Allow' : 'Deny',
        Action: [ 'execute-api:Invoke' ],
        Resource: [ `arn:aws:execute-api:${region}:${awsAccountId}:${restApiId}/${stage}/*/*` ]
      }
    ]
  }
}

module.exports = {
  _generatePolicy: generatePolicy,
  handler: handler
}
