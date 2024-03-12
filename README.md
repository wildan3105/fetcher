## fetcher

A simple CLI app to fetch and download contents from given link(s)

## How to run

### Using TypeScript file directly

**Prerequisite**
This requires `ts-node` to be installed globally on your machine.

1. Install the dependencies

```bash
npm i
```

2. Run the app

```
ts-node fetcher.ts -h
```

**Note**
The HTML files will be stored relative to the location of the TypeScript file.

### Using npm (easiest, recommended way)

1. Install the dependencies

```bash
npm i
```

2. Build the project

```bash
npm run build
```

3. Install the package globally on your local machine

```bash
npm i -g .
```

4. Run the app

```bash
fetcher -h
```

**Note**
When installed via npm, the CLI tool operates relative to your current working directory, allowing it to save HTML files in your current location.

### Using docker

1. Build the docker image

```bash
docker build -t fetcher .
```

2. Run the app

```
docker run fetcher -h
```

**Note**
With Docker, the CLI tool operates inside a container, and any HTML files it creates are confined to the container's file system. They are not directly accessible from outside the container without additional steps like copying or mounting volumes (which requires additional steps and time to configure).

## Usage

```bash
$ ./fetcher --help

  CLI program to fetch web pages and save them for later retrieval and browsing

  Arguments:
    links                      A space-separated links with the protocol (http or https)

  Options:
    -V, --version              output the version number
    --metadata                 Show additional information about the fetched web pages, such as the date and time of retrieval, number of images, and number of links.
    --override-max-links       Allow fetching of more than the default maximum of 5 links per execution. Use this option to process an unlimited number of links.
    --set-max-timeout [value]  Specify a custom timeout (in minutes) for fetching and downloading content. The default timeout is 5 minutes, and the maximum allowed timeout is 10 minutes. Value must be a
                              positive number up to 10.
    -h, --help                 display help for command

  Examples
    $ ./fetcher https://wildans.id
    $ Success for http://wildans.id HTML content stored as /mnt/c/Users/62823/Documents/fetcher-files/wildans.id.html
```

## Future improvements

-   Separation of concern for handling: getting the data and generating output message
-   Standardize error log format
-   Better error propagation (throw error in certain places and handle in higher level)
