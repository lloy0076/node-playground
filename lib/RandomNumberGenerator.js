const Boom = require('@hapi/boom');

class RandomNumberGenerator {
    /**
     * Construct a random number generator.
     *
     * @param max
     */
    constructor(max = 255) {
        this.upTo = max;
    }

    /**
     * Get the next number.
     *
     * @return {number}
     */
    next() {
        return Math.round(Math.random() * this.getUpTo());
    }

    /**
     * Gets the current 'upTo'.
     *
     * @return {*}
     */
    getUpTo() {
        return this.upTo;
    }

    /**
     * Sets upTo.
     *
     * @param value
     * @return {RandomNumberGenerator}
     */
    setUpTo(value) {
        const setTo = Number.parseInt(value, 10);

        if (!Number.isNaN(value)) {
            this.upTo = setTo;
            return this;
        }

        throw new Boom.Boom(`Attempt to set "upTo" to an invalid value: ${value}`);
    }
}

module.exports = RandomNumberGenerator;
