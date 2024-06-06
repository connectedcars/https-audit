# https-audit
Audit job for checking https setups is correct and certificates are valid


## Example

``` bash
./build/dist/bin/http-cert-audit.js testing.connectedcars.io connectedcars.io
```

## Usage

Launch with enviroment variables:

* DNS_NAMES: comma seperated list of domains to check
* CHECK_INTERVAL: interval in seconds to check the domain
