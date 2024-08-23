# Copyright 2022 Adobe
# All Rights Reserved.

# NOTICE: Adobe permits you to use, modify, and distribute this file in
# accordance with the terms of the Adobe license agreement accompanying
# it.
#!/bin/bash
echo "Removing aemg-docs site..."
curl -u admin:admin -F ':operation=delete' http://localhost:4502/conf/aemg-docs
curl -u admin:admin -F ':operation=delete' http://localhost:4502/content/dam/aemg-docs
curl -u admin:admin -F ':operation=delete' http://localhost:4502/content/experience-fragments/aemg-docs
curl -u admin:admin -F ':operation=delete' http://localhost:4502/content/aemg-docs

npm run undeploy && node ./redeploy.js && npm run build && npm run deploy

echo "-----------------------"
echo "| Manual tasks needed |"
echo "-----------------------"
echo "1. Create 'aemg-docs' Sites-30 site"
echo "2. Re-install aemg-docs content package (aemg-docs-content-only.zip)"
