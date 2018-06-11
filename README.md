# Sequencer

Provides an easy way to schedule tasks and add 
logic around how to progress from one task to the other.

Built as a serverless template, to be used inside 
your application and subsequently extended with your
own custom task runners.
    
## Getting Started

Requirements:
* Postgresql (storage)
* AWS account (to run your lambdas)
* Docker (rebuilding node_modules to match deploy target)

* Run `npm install`
* Change dir to lib and run `npm install`
    * Note, this is so the deploy does not get any development dependencies, to make the final package as small as possible
* Create a crypt key in AWS KMS
    * https://console.aws.amazon.com/iam/home?region=us-west-2#/encryptionKeys/us-west-2
    * Assign your user rights to work with it
    * After we have deployed we can grant rights to the AWS users that's created from serverless
* Setup `lib/config.yml`
    * Update configuration to include postgres auth info, create a `uniqueNamedKey` for your password
    * vpc information is optional
    * Make sure to add the cryptkey that we generated earlier
    * Encrypt your postgres password in the lib dir
        ```bash
        cd lib
        sls encrypt -n uniqueNamedKey -t 'password' --stage prod --save
        ```
    * Commit the generated file to source control for your team to use
    
* Duplicate `/sequelizeExample.json` and name it `sequelize.json`
    * Update all the config in there to match your database, do not commit this to source control, it has plaintext passwords 
* Run DB Migrations
    * `sequelize db:migrate --env prod --config sequelize.json`
* Deploy from within the `lib` directory
    * `sls deploy --stage prod`
    * This command will take a little while
* Setup the IAM Encryption Key to allow the new user's account
    * https://console.aws.amazon.com/iam/home?region=us-west-2#/encryptionKeys/us-west-2
    * Find Your Key
    * Scroll down to the `Key Users` section
    * Click add
    * Search `sequencer` you should find one that has your env defined
    * Check the box, and attach
* Phew. You are done with the initial install.
    
## Task Runners
For your continence we have
provided a set of pre-made task runners:

* Flow Control:
    * GoTo
    * Conditional
    * Goal
* Generic Runners:
    * WaitForDate
    * WaitForDuration
    * Email
    * SMS

### WaitForDate

Waits until the specified date is now or in the past to continue.

```JSON
{
  // ISO 8601 date
  "date": "2018-06-08T17:49:31+00:00"    
}
```

### WaitForDateComparison

Waits until the specified day of the week

```
{
    // Moment.js getter https://momentjs.com/docs/#/get-set/get/
    "attribute": "year|month|date|hour|minute",
    // list of values to compare result to. If one matches it continues
    "values": [0,1,3,6]
}
``` 

### WaitForDuration

Waits for a given amount of time

```JSON
{
  "amount": 21, // {Number}
  "unit": "[years|quarters|weeks|months|days|hours|minutes|seconds|milliseconds]"
}
```

### Email

Send an email

```JSON
{
  "from": "email@example.com",
  "to": ["target@example.com", "target2@example.com"],
  "cc": ["target3@example.com"],
  "bcc": ["target4@example.com"],
  "text": "Custom Email Text",
  "html": "<h1>Hello</h1>",
  "subject": "this is an email"
}
```

### SMS

Send an sms

```JSON
{
  "from": "+11231231234",
  "to": "+11231231234",
  "message": "Hello world"
}
```

### GoTo

Jumps to a different step, given the step ID

### Goal

Checked every cycle to see if the conditional has been achieved. If it has, 
it will bypass all the other given steps and execute.

```json
{
  "checkLambda": "lambda:arn"
}
```

### Conditional

If the conditional returns true, continue down the normal path. If false it
will divert to the alternate path.

```json
{
  "checkLambda": "lambda:arn"
}
```
