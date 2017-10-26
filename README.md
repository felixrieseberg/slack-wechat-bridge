# Slack - WeChat Bridge
This is Node app that allows you to post messages in Slack Channels to a WeChat group - and messages posted in WeChat group to a Slack channel. It's essentially a bridge. It works well, but has hard requirements:

* A WeChat account created before July 2017 (WeChat has turned off access to the web api for accounts created after)
* A hosting environment that supports puppeteer, Google's solution for controlling a headless Chrome instance

# License
MIT