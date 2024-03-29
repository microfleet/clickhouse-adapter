module.exports = {
  "repo": "makeomatic/node",
  "node": "18",
  "nycCoverage": false,
  "test_framework": "jest --verbose -i -b -c ../../jest.config.js --coverageDirectory <coverageDirectory>",
  "tests": "../clickhouse-adapter/test/suites/**/*.ts",
  "auto_compose": true,
  "with_local_compose": true,
  "docker_compose": "./test/docker-compose.yml",
  "extras": {
    "tester": {
      "working_dir": "/src/packages/clickhouse-adapter",
      "volumes": [
        "${PWD}/../../:/src:cached"
      ],
      "environment": {
        "TS_NODE_TRANSPILE_ONLY": "true",
        "TS_NODE_TYPE_CHECK": "false",
        "DEBUG": "${DEBUG}"
      }
    }
  }
}
