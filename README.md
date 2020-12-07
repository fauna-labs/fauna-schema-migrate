# faunadb-schema-migrate
FaunaDB Migrate is an opinionated tool with two objects: 

- help [faunadb](https://fauna.com) developers **set up** **and manage** their FaunaDB entities such as Indexes/Collections/User Defined Functions (UDFs) **as code**, regardless of whether these are created via a GraphQL schema or via FQL. 
- provide support for fault-proof **schema migrations** for bigger teams. 

Although **data migrations** can be done as well, this is a very different problem, see the section on data migration for more information. 



#### Setup

....



### The approach? Opinionated and optimized for FQL and GraphQL. 

#### Keep FQL composable

The FaunaDB Query Language (FQL) is very different than other query languages like SQL, Cypher or ORM approaches. One of the features that are worth embracing in FQL is that writing FQL queries is essentially function composition. For example:

```javascript
Collection("accounts"), "268431417906561542")
```

is just a reference to a collection. Throw that in another function to get a reference to a document within that collection.

```javascript
Ref(
  Collection("accounts"),
  "268431417906561542"
)
```

That beautiful part is that these are just functions that define your query and we can use the host language (in this case JavaScript) to start saving snippets of queries for reuse. A very silly example would be: 

```javascript
const accountCollection = Collection("accounts")
const account = Ref(accountCollection,"268431417906561542")
...
```

But you can imagine when queries implement complex transactional logic or start joining extensively that this becomes very useful. It's something we take advantage of in many examples such as [Fwitter](https://css-tricks.com/rethinking-twitter-as-a-serverless-app/) or [the authentication skeletons](https://github.com/fauna-brecht/skeleton-auth) to define return formats only once or write reusable snippets that can be easily mixed into other queries. For example,  a query that creates a new user but also implements rate limitation and adds validation could be abstracted away in JavaScript as follows:

```javascript
function CreateUser(email, password) {
	let FQLStatement = <query to create a user> 
	FQLStatement = ValidateEmail(FQLStatement, email, ['data', 'email'])
	FQLStatement = ValidatePassword(FQLStatement, password, ['data', 'password'])
	return AddRateLimiting('register', FQLStatement, email)
}
```

What ValidateEmail, ValidatePassword or AddRateLimiting do is not important, but it's important that this composability might be used and we want to make sure it doesn't conflict with our migrations. If we directly use the widely used approach of many migration frameworks of writing up/down statements as popularized by Rails (as far as I know) .  For example: 

```javascript
module.exports.up = () => {
  return CreateCollection({ name: 'Users' })
}

module.exports.down = () => {
  return Delete(Collection('Users'))
}
```

This might be a bad idea in case the up definition would have looked like: 


```javascript
import { CreateOrUpdateFunction } from './../helpers/fql'

module.exports.up = () => {
  CreateFunction(
    'register',
    Query(Lambda(['email', 'password'], 
      RegisterAccountWithEmailVerification(Var('email'), Var('password'))))
  )
}
...
```

Your migration is no longer **fixed** as this code that was important can evolve separately from the migration and that's probably hard to manage. This is something that's quite unlikely for the creation of indexes and collections but becomes a real problem for User Defined Functions that want to share some logic. 

### Do less work and reduce the possibility of errors. 

The idea of this schema framework library is not only to  help support stable schema migrations. First and foremost it's intended to help express FaunaDB resources as code. In essence support the resources equivalent of Infrastructure as Code (IaC)  but you can't really call this 'infrastructure' since FaunaDB handles all infrastructure for you. 

If we define a function, index or collection as follows

```javascript
module.exports.up = () => {
  CreateFunction(name, body)
}
```

The down function can easily be derived so it would be a bit silly to ask the user to write this. Especially since down migrations are often not tested thoroughly so it's easy to get them wrong.  

Instead we chose to let the user define the essence of the function. 

```javascript
{
  name: name,
  body: body,
  role: role
}
```

And we will take care of detecting a **create/update** and will generate **deletes** for the reverse action. 

### Detect dependencies.

Functions can depend on roles or can depend on collections and typically you would define these in one migration. This requires you sometimes to: 

- Define the Role
- The define the function that uses the role
- Define the role that can call the function.

Instead of requiring the user to think of this order we'll detect it and order the different resources in **one migration** automatically.

### Both for GraphQL and FQL

Resources can also be defined via the GraphQL schema and users can use both at the same time. The library allows to use to define a GraphQL schema which would create collections/indexes/UDFs for you and update the UDFs via the migrations and add additional collections/indexes to support your FQL queries.   

## Notes on data migration

This library is not intended for data migration but can be used for  simple migrations. For bigger datasets and complex migrations I would argue that it t probably does not solve the main problem.

The reasoning is as follows; one has to think about scale when writing scripts to migrate data on a massive scalable database. FaunaDB protects you to write a big transaction that might run for a long time and impair your performance with mandatory pagination. This obligates you to separate such a big data migration in multiple queries.  That also means that one huge data migration will not be performed in one transaction. If batching data does not work, that's often a sign that the migration strategy should probably be revised since a huge migration transaction that runs for several hours is also a big risk. 

Instead you could start the migration at the moment you deploy the new code, keep the timestamp when the migration started and after completing the batches, verify which new data that arrives that was still inserted with the old code and should be migrated and go through the pages again. Until we arrive at a point that the 'new data' is an empty page in which case we successfully migrated all data. 

This clearly requires your code to be able to deal with both the old format as the new format of the data in given certain timespan which is something that's advisable regardless of the database. There are moments where this is simply not possible due to a difficult implementation process that involves many services. In that case there are two things you can do:

- Temporary change your queries to work on a snapshot using FaunaDB's temporality and pause/block new creates/writes (allow reads, block writes)
- Temporary take down the application until the migration is complete
  (block both reads and writes)

For such migrations it's also questionable whether a 'down' is worth writing which would essentially make the migration a 'script runner'. 

There might be value in looking into a separate npm library to help with such complex migrations. At this point, the [FaunaDB Data Manager](https://docs.fauna.com/fauna/current/integrations/fdm/index.html) would be a better option. 



