/**
 * @fileoverview Check internal rule
 * @author Armano <https://github.com/armano2>
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("eslint/lib/rules/indent"),
    RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
        ecmaFeatures: {},
    },
    parser: "typescript-eslint-parser",
});

ruleTester.run("indent", rule, {
    valid: [
        `
@Component({
    components: {
        ErrorPage: () => import('@/components/ErrorPage.vue'),
    },
    head: {
        titleTemplate(title) {
            if (title) {
                return \`test\`
            }
            return 'Title'
        },
        htmlAttrs: {
            lang: 'en',
        },
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
    },
})
export default class App extends Vue 
{
    get error() 
    {
        return this.$store.state.errorHandler.error
    }
}
        `,
        // https://github.com/eslint/typescript-eslint-parser/issues/474
        `
/**
 * @param {string} name
 * @param {number} age
 * @returns {string}
 */
function foo(name: string, age: number): string {}
        `,
        `
const firebaseApp = firebase.apps.length
    ? firebase.app()
    : firebase.initializeApp({
        apiKey: __FIREBASE_API_KEY__,
        authDomain: __FIREBASE_AUTH_DOMAIN__,
        databaseURL: __FIREBASE_DATABASE_URL__,
        projectId: __FIREBASE_PROJECT_ID__,
        storageBucket: __FIREBASE_STORAGE_BUCKET__,
        messagingSenderId: __FIREBASE_MESSAGING_SENDER_ID__,
    })
        `,
    ],
    invalid: [],
});
