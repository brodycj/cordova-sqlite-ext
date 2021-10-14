/* 'use strict'; */

var MYTIMEOUT = 12000;

var DEFAULT_SIZE = 5000000; // max to avoid popup in safari/ios

var isWindows = /Windows /.test(navigator.userAgent); // Windows (...)
var isAndroid = !isWindows && /Android/.test(navigator.userAgent);

var scenarioList = [
  isAndroid ? 'Plugin-implementation-default' : 'Plugin',
  'HTML5',
  'Plugin-implementation-2'
];

var scenarioCount = (!!window.hasWebKitBrowser) ? (isAndroid ? 3 : 2) : 1;

var mytests = function() {

  for (var i=0; i<scenarioCount; ++i) {

    describe(scenarioList[i] + ': BLOBFROMBASE64 encoding test(s)', function() {
      var scenarioName = scenarioList[i];
      var suiteName = scenarioName + ': ';
      var isWebSql = (i === 1);
      var isImpl2 = (i === 2);

      // NOTE: MUST be defined in proper describe function scope, NOT outer scope:
      var openDatabase = function(name, ignored1, ignored2, ignored3) {
        if (isImpl2) {
          return window.sqlitePlugin.openDatabase({
            // prevent reuse of database from default db implementation:
            name: 'i2-'+name,
            androidDatabaseImplementation: 2,
            androidLockWorkaround: 1,
            iosDatabaseLocation: 'Documents'
          });
        }
        if (isWebSql) {
          return window.openDatabase(name, "1.0", "Demo", DEFAULT_SIZE);
        } else {
          return window.sqlitePlugin.openDatabase({name: name, location: 'default'});
        }
      }

      describe(suiteName + 'SELECT BLOBFROMBASE64 value test(s)', function() {

        it(suiteName + "SELECT HEX(BLOBFROMBASE64('AQID')) [X'010203'] INLINE", function(done) {
          if (isWebSql) pending('SKIP: BLOBFROMBASE64 not supported by Web SQL');
          if (!isWebSql && isAndroid && isImpl2) pending("SKIP: BLOBFROMBASE64 not supported with androidDatabaseProvider: 'system'");

          var db = openDatabase('SELECT-BLOBFROMBASE64-AQID-AS-HEX-VALUE-INLINE.db');

          db.transaction(function(tx) {
            tx.executeSql("SELECT HEX(BLOBFROMBASE64('AQID')) AS hex_value", [], function(ignored, rs) {
              expect(rs).toBeDefined();
              expect(rs.rows).toBeDefined();
              expect(rs.rows.length).toBe(1);
              expect(rs.rows.item(0).hex_value).toBe('010203');

              // Close (plugin only) & finish:
              (isWebSql) ? done() : db.close(done, done);
            });
          });
        }, MYTIMEOUT);

        it(suiteName + "SELECT HEX of BLOBFROMBASE64 with 'AQID' [X'010203'] parameter", function(done) {
          if (isWebSql) pending('SKIP: BLOBFROMBASE64 not supported by Web SQL');
          if (!isWebSql && isAndroid && isImpl2) pending("SKIP: BLOBFROMBASE64 not supported with androidDatabaseProvider: 'system'");

          var db = openDatabase('SELECT-HEX-of-BLOBFROMBASE64-AQID-AS-HEX-VALUE.db');

          db.transaction(function(tx) {
            tx.executeSql("SELECT HEX(BLOBFROMBASE64(?)) AS hex_value", ['AQID'], function(ignored, rs) {
              expect(rs).toBeDefined();
              expect(rs.rows).toBeDefined();
              expect(rs.rows.length).toBe(1);
              expect(rs.rows.item(0).hex_value).toBe('010203');

              // Close (plugin only) & finish:
              (isWebSql) ? done() : db.close(done, done);
            });
          });
        }, MYTIMEOUT);

        it(suiteName + "SELECT HEX of BLOBFROMBASE64 with 'AQID AQIE AQIF' [X'010203010204010205' - spaces ignored] parameter", function(done) {
          if (isWebSql) pending('SKIP: BLOBFROMBASE64 not supported by Web SQL');
          if (!isWebSql && isAndroid && isImpl2) pending("SKIP: BLOBFROMBASE64 not supported with androidDatabaseProvider: 'system'");

          var db = openDatabase('SELECT-HEX-of-BLOBFROMBASE64-AQID-AS-HEX-VALUE.db');

          db.transaction(function(tx) {
            tx.executeSql("SELECT HEX(BLOBFROMBASE64(?)) AS hex_value", ['AQID AQIE AQIF'], function(ignored, rs) {
              expect(rs).toBeDefined();
              expect(rs.rows).toBeDefined();
              expect(rs.rows.length).toBe(1);
              expect(rs.rows.item(0).hex_value).toBe('010203010204010205');

              // Close (plugin only) & finish:
              (isWebSql) ? done() : db.close(done, done);
            });
          });
        }, MYTIMEOUT);

      });

      describe(suiteName + 'INSERT BLOB data from BLOBFROMBASE64 & check stored data', function() {

        it(suiteName + "INSERT BLOBFROMBASE64 from 'AQID AQIE AQIF' [X'010203010204010205' - spaces ignored], SELECT as BASE64, and check type", function(done) {
          if (isWebSql) pending('SKIP: BLOBFROMBASE64 not supported by Web SQL');
          if (!isWebSql && isAndroid && isImpl2) pending("SKIP: BLOBFROMBASE64 not supported with androidDatabaseProvider: 'system'");

          var db = openDatabase('INSERT-BLOBFROMBASE64-AQID-AQIE-AQIF-and-check.db');

          db.transaction(function(tx) {
            tx.executeSql('DROP TABLE IF EXISTS tt');
            tx.executeSql('CREATE TABLE tt (data)');
            tx.executeSql("INSERT INTO tt VALUES(BLOBFROMBASE64(?))", ["AQID AQIE AQIF"]);
          }, function(error) {
            // NOT EXPECTED:
            expect(false).toBe(true);
            expect(error.message).toBe('--');
            done();
          }, function() {
            db.transaction(function(tx2) {
              tx2.executeSql("SELECT HEX(data) AS hex_value from tt", [], function(ignored, rs) {
                expect(rs).toBeDefined();
                expect(rs.rows).toBeDefined();
                expect(rs.rows.length).toBe(1);
                expect(rs.rows.item(0).hex_value).toBe('010203010204010205');

                tx2.executeSql("SELECT TYPEOF(data) AS value_type from tt", [], function(ignored, rs2) {
                  expect(rs2).toBeDefined();
                  expect(rs2.rows).toBeDefined();
                  expect(rs2.rows.length).toBe(1);
                  expect(rs2.rows.item(0).value_type).toBe('blob');

                  // Close (plugin only) & finish:
                  (isWebSql) ? done() : db.close(done, done);
                });
              });
            });
          });
        }, MYTIMEOUT);



      });

    });

  }

}

if (window.hasBrowser) mytests();
else exports.defineAutoTests = mytests;

/* vim: set expandtab : */
