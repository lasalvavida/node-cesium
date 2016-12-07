module.exports = {
    quote           :  '\''         // '\'' or '"'
  , style           :  'var'        // 'var', 'comma', 'comma-first'
  , indent          :  4            // the tab size used in your project
  , directoryFilter :  null         // not supported yet
  , fileFilter      :  '.js'        // the extension of the file to upgrade
  , dryrun          :  false        // true|false if true no changes will be written to upgraded files
  , moveStrict      :  true         // true|false if true moves 'use strict;' statement to the top of the file
};
