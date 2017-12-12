# Property Management

[![Build Status](https://travis-ci.org/xtreemze/PropertyManagement.svg?branch=master)](https://travis-ci.org/xtreemze/PropertyManagement)
![Dependency Status](https://david-dm.org/xtreemze/PropertyManagement/status.svg?branch=master)
![Dev Dependency Status](https://david-dm.org/xtreemze/PropertyManagement/dev-status.svg?branch=master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

#### Code Style

Javascript ES6

### Development

Emoji explained in CONTRIBUTING.md. Please test your solutions thoroughly
before publishing and check Travis to make sure your build passed without
errors.

You will see console.log used here and there. In production these will be
commented out but in the meantime we are keeping these online to make
debugging easier. Feel free to add yours but please label them like so:

```javascript
console.log("[Identifier]", variable);
console.warn("[OtherIdentifier]", otherVariable);
```

#### Production Export

Use

```javascript
npm run exportp
```

to export the files to the “public” directory as a static progressive
web-app with offline support. To include new js files, make sure to add
the

```javascript
require(‘./app/js/yourFilename.js’)
```

to

```
./entry.js
```

so it can be processed and compiled by webpack.

#### Live Development Server

You are motivated to use

```javascript
npm run dev
```

to run a localhost test and ensure there are no errors before publishing.
CSS changes will update without the need to reload. Javascript changes
will cause a reload and HTML changes will require a manual reload.

## Hosting

The example project is hosted on a public github repository using the
gh-pages branch. Travis CI will automatically upload builds from the
master branch if they pass the tests successfully.
https://xtreemze.github.io/PropertyManagement/

## Target Environment

Modern browsers are targeted, primarily on the mobile end. Because target
browsers have acceptable support for ES6, we will not be using Babel in
Webpack. This app is meant to be a single page app with javascript driving
changes in the DOM. It currently utilizes ES6 template strings to make
HTML templates within Javascript. For example:

```javascript
this.card = `<div class="cardContainer" id="${this.title}">
<div class="col s12 m6">
  <div class="card">
    <div class="card-content">
      <span class="card-title">${this.title}</span>${
  this.description
}</div>
  </div>
</div>
</div>
`;
// Add HTML to DOM
window.sampleElementID.innerHTML = this.card;
```

# Front End

### Graphic Design Guidelines

Material Design https://material.io/guidelines/ Use icons to replace text
whenever possible.

### Design Philosophy

Design should be mobile first and should generally adhere to the
Progressive Web App philosophy whenever possible. These are only
guidelines so if you know the rules and have a good reason to break them,
go ahead! https://developers.google.com/web/progressive-web-apps/

### Front-End Framework

Materialize-CSS is chosen for the front end
http://materializecss.com/getting-started.html Alpha Version 1.0 is
currently used which removes the jQuery dependency. Please report any bugs
to the Materialize CSS team. So far the errors are not critical and some
workarounds have been used until the bugs are fixed.

# Back End

### Database Server

A Mongo Database is available with 512 MB storage. Offline data can also
be used and stored with localStorage.

### Continuous Integration

Configured for automatic Travis CI deployment to gh-pages branch only when
webpack compiles without errors.

### License

The app is to be open source according to the GNU GENERAL PUBLIC
LICENSE 3.
