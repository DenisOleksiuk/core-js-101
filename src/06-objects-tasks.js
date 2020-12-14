/* ************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  class R {
    constructor() {
      this.width = width;
      this.height = height;
    }

    getArea() {
      return this.width * this.height;
    }
  }
  return new R();
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  return Object.setPrototypeOf(JSON.parse(json), proto);
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

function stringify() {
  const {
    element,
    id,
    classes,
    attrs,
    pseudoClasses,
    pseudoElement,
  } = this.parts;
  return [element, id, classes, attrs, pseudoClasses, pseudoElement].flat().join('');
}

const cssSelectorBuilder = {
  element(value) {
    if (this.parts.element) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    if (['id', 'classes', 'attrs', 'pseudoClasses', 'pseudoElement'].some((key) => this.parts[key])) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    return Object.setPrototypeOf({ parts: { element: value }, stringify }, cssSelectorBuilder);
  },

  id(value) {
    if (this.parts.id) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    if (['classes', 'attrs', 'pseudoClasses', 'pseudoElement'].some((key) => this.parts[key])) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    return Object.setPrototypeOf(
      { parts: { ...this.parts, id: `#${value}` }, stringify },
      cssSelectorBuilder,
    );
  },

  class(value) {
    if (['attrs', 'pseudoClasses', 'pseudoElement'].some((key) => this.parts[key])) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    return Object.setPrototypeOf({
      parts: {
        ...this.parts,
        classes: [...this.parts.classes || [], `.${value}`],
      },
      stringify,
    }, cssSelectorBuilder);
  },

  attr(value) {
    if (this.parts.pseudoClasses || this.parts.pseudoElement) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    return Object.setPrototypeOf({
      parts: {
        ...this.parts,
        attrs: [...this.parts.attrs || [], `[${value}]`],
      },
      stringify,
    }, cssSelectorBuilder);
  },

  pseudoClass(value) {
    if (this.parts.pseudoElement) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    return Object.setPrototypeOf({
      parts: {
        ...this.parts,
        pseudoClasses: [...this.parts.pseudoClasses || [], `:${value}`],
      },
      stringify,
    }, cssSelectorBuilder);
  },

  pseudoElement(value) {
    if (this.parts.pseudoElement) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    return Object.setPrototypeOf(
      { parts: { ...this.parts, pseudoElement: `::${value}` }, stringify },
      cssSelectorBuilder,
    );
  },

  combine(selector1, combinator, selector2) {
    return {
      stringify() {
        return `${selector1.stringify()} ${combinator} ${selector2.stringify()}`;
      },
    };
  },
  parts: {},
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
