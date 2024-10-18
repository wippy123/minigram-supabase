
      var page = require('webpage').create();
      page.viewportSize = { width: 1024, height: 768 };
      page.open('https://www.golftown.com', function() {
        page.render('/Users/stormo/projects/minigram-supabase/screenshot.png');
        phantom.exit();
      });
    