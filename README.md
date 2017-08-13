Falcon
======
A modern, cross-platform, and universal database client

**⚠️ HIGHLY EXPERIMENTAL ⚠️**

[![Build Status](https://travis-ci.org/falcon-client/falcon.svg?branch=master&maxAge=2592)](https://travis-ci.org/falcon-client/falcon)
[![Build status](https://ci.appveyor.com/api/projects/status/wmov6a92b7j1gs83/branch/master?svg=true)](https://ci.appveyor.com/project/amilajack/falcon/branch/master)
[![Dependency Status](https://img.shields.io/david/falcon-client/falcon.svg?maxAge=2592)](https://david-dm.org/falcon-client/falcon)

### IDEA:
![Falcon Home Page Preview](https://raw.githubusercontent.com/amilajack/falcon-ui-rewrite-2/master/internals/img/falcon-demo.png)

## Installation
```bash
git clone https://github.com/falcon-client/falcon.git
cd falcon
yarn

# Development
yarn dev

# Package for production
yarn package

# Run tests
yarn test
```

## Roadmap
* Release 1.0.0
  * Save, encrypt connections
  * View database content and structure
  * Add support for SQLITE, CSV, MYSQL
  * Connect to multiple sessions in different tabs
  * Create, Read, Update, Delete data from the GUI
  * Connect using SSH
* Release 2.0.0
  * Add support for Mongo, Postgres, Maria, Cassandra
  * View database relationships

## Related:
* [falcon-core](https://github.com/falcon-client/falcon-core)
