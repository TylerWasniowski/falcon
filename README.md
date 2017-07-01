Falcon
======
A modern, cross-platform, and universal database client

**⚠️ HIGHLY EXPERIMENTAL ⚠️**

[![Build Status](https://travis-ci.org/falcon-client/falcon.svg?branch=master&maxAge=2592)](https://travis-ci.org/falcon-client/falcon)
[![Build status](https://ci.appveyor.com/api/projects/status/lx2uenj9yosihd1q/branch/master?svg=true)](https://ci.appveyor.com/project/amilajack/falcon-fsmac/branch/master)
[![Dependency Status](https://img.shields.io/david/falcon-client/falcon.svg?maxAge=2592)](https://david-dm.org/falcon-client/falcon)

### IDEA:
![Demo](https://raw.githubusercontent.com/falcon-client/falcon/4b064b2f53016d6a4e4bed42576c6a8c514e1040/internals/img/falcon-preview.jpg)

## Installation
```bash
git clone https://github.com/falcon-client/falcon.git
cd falcon
yarn
cd app && yarn && cd ..

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
