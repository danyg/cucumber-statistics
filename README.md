Cucumber Statistics
===================

## What's it for?

Cucumber Statistics is a stand alone node server that is able to store information
about cucumber executions.
The idea of this project is to simplify the daily work of a person who wants to
keep tracking of nightly builds of a project.
Cucumber Statistics provides statistics about the stability of scenarios and
step definitions for a cucumber test suite. Also provides a easy way to see all
the failed scenarios the last night when dealing with many nightly builds.
Cucumber Statistics can be replaced with jenkins plugins with the same purpose,
if you don't have jenkins or your jenkins server configuration is out of your
control but not the jobs configuration, then Cucumber Statistics is for you.

## How is it?
You can see some [Screenshots](http://danyg.github.io/cucumber-statistics/) following the link.

## How To?

In order to use Cucumber Statistics you will need the following prerequisites

- A PC with node.js >= v4 installed and git(optional).
- Control of the firewall, cucumber-statistics uses the port 9088, to serve the
web page and the REST service to push and get information of cucumber.
- (optional) be able to inject bash commands or similar in your nightly/automated
job test process, if you can't you will have to push the data manually.

### In your server
If you don't have git in your server or you don't want to have you can download
it from github.
[Download as zip](https://github.com/danyg/cucumber-statistics/archive/master.zip)
or you can use wget...

**Normal Use**
```
git clone https://github.com/danyg/cucumber-statistics.git
npm install
node main --mongodb
```

Now cucumber-statistics is working (assuming you don't have a firewall need to
be configured).
cucumber-statistics will show you all the interfaces available where you can
reach it when running.

### In your CI job
You need to investigate how to add an after build process, and send the
generated cucumber.json to your server.

#### Using curl
```
curl -i -X PUT http://<YOUR_SERVER_URL>:9088/db/set/$BUILD_NAME/$BUILD_NUMBER -H "Content-Type: application/json" --data-binary "@./trunk/myProject/target/cucumber/cucumber.json" >/dev/null 2>&1 | exit 0;
```

- ```<YOUR_SERVER_URL>``` the ip of your server or a domain if you have one.
- ```$BUILD_NAME``` is the name of the job in Jenkins, this is really important,
cucumber-statistics splits the information by BUILD_NAME / Nightly Name / Job
name / project
- ```$BUILD_NUMBER``` have to be some consecutive number in each execution.
Jenkins also provides this environment property.
- ```--data-binary``` here is where you need to write the path to your
cucumber.json (if you don't know what or where it is, google for cucumber json
reports for your cucumber implementation)
- the ```>/dev/null 2>&1``` will send stdout and stderr to /dev/null and
- and ```| exit 0``` will prevent that any issue sending the file to the server
could cause a failure in your nightly/automated job.

### How To stop it?
You probably don't want to :P.
```wget http://<YOUR_SERVER_URL>:9088/admin/shutdown```

## Develop

### Run acceptance tests
- ```sudo apt-get install xvfb firefox``` or ```sudo yum install Xvfb firefox```
- ```npm test```

run tests marked as @ToTest
- ```npm run toTest```
