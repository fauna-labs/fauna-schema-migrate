import chalk from 'chalk'
import { retrieveAllResourcePaths } from '../util/files'

// Not used atm.

// This is a hypothetical functionality that I might implement later on.

// There are three 'truths' of your Fauna resources since due to the way that
// composition works, fauna-migrate is something in between terraform and a
// traditional migration tool.

// 1. Resources:      Your code, FQL or JS files, they might change depending on an import
// 2. Migrations:     Derived from resources, then set in stone!
// 3. Database:       Your actual database configuration, hopefully defined
//                    solely by the migrations. Of course, someone could have
//                    done a manual change. Since the fauna dashboard is quite
//                    easy to use this might be tempting. That's what validate is for!
//
// Validate essentially validates that your current database state
// is conform to what your migrations expect and will simply warn you
// in case there are differeces. You are free to ignore these differences
// and just call 'apply' in case you know what you are doing.
// validate --fix would then be an option to reset the state of your database
// back to your migrations. Reach out if this makes sense/is necessary.

const validateApply = async () => Promise.resolve()

export default validateApply
