import * as assert from "power-assert";
import * as Vue from "vue";
import VueComponent from "../lib/index";
import { jsdom } from "jsdom";

global["document"] = jsdom("<html><body>dummy document</body></html>");
global["window"] = document.defaultView;

describe("vue-component-decorator", function () {
    describe("hooks", function () {
        @VueComponent()
        class Base extends Vue {
            created_: boolean;
            destroyed_: boolean;
            data(): any { return { created_: false, destroyed_: false }; }
            created() { this.created_ = true; }
            destroyed() { this.destroyed_ = true; }
        };
        it("basic", function () {
            const c = new Base();
            assert(c.created_ === true);
            assert(c.destroyed_ === false);
            c.$destroy();
            assert(c.destroyed_ === true);
        });

        @VueComponent()
        class Extended extends Base {
            created_ex: boolean;
            destroyed_ex: boolean;
            data() { return { created_ex: false, destroyed_ex: false }; }
            created() { this.created_ex = true; }
            destroyed() { this.destroyed_ex = true; }
        }
        it("extended - hooks of both Base and Extended are called", function () {
            const c = new Extended();
            assert(c.created_ === true && c.destroyed_ === false);
            assert(c.created_ex === true && c.destroyed_ex === false);
            c.$destroy();
            assert(c.destroyed_ === true);
            assert(c.destroyed_ex === true);
        });
    });

    describe("props", function () {
        @VueComponent({ template: "<div>Test</div>" })
        class Basic extends Vue {
            @VueComponent.prop()
            msg1: string;
            @VueComponent.prop({ default: "value2default" })
            msg2: string;
        }
        it("basic", function () {
            const vm = new Vue({
                template: "<div><test v-ref:target msg1='value1' /></div>",
                components: {test: Basic}
            });
            vm.$mount();
            const c = vm.$refs["target"] as Basic;
            assert(c.msg1 === "value1");
            assert(c.msg2 === "value2default");
        });

        @VueComponent()
        class Extended extends Basic {
            @VueComponent.prop({ default: "value2extended" })
            msg2: string;
            @VueComponent.prop()
            msg3: string;
        }
        it("extended - props from both Basic and Extended are enabled", function () {
            const vm = new Vue({
                template: "<div><test v-ref:target msg1='value1' msg3='value3' /></div>",
                components: {test: Extended}
            });
            vm.$mount();
            const c = vm.$refs["target"] as Extended;
            assert(c.msg1 === "value1");
            assert(c.msg2 === "value2extended");
            assert(c.msg3 === "value3");
        });
    });
});
