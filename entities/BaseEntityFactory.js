import {addComponent, addEntity} from "../bitecs.mjs";
export class BaseEntityFactory {
    #world;

    /**
     * Creates a new EntityFactory instance
     * @param {object} world - The bitecs world object
     */
    constructor(world) {
        this.#world = world;
    }

    /**
     * Adds a component to an entity
     * @private
     * @param {object} component - The component to add
     * @param {number} eid - The entity id
     */
    #addComponent(component, eid) {
        addComponent(this.#world, component, eid);
    }

    /**
     * Add multiple components to an entity
     * @protected
     * @param {number} eid - The entity id
     * @param {...object} components - The components to add
     */
    _addComponents(eid, ...components) {
        components.forEach(component => this.#addComponent(component, eid));
    }

    /**
     * Creates a new entity
     * @private
     * @returns {number} The created entity id
     */
    #createEntity() {
        return addEntity(this.#world);
    }

    /**
     * Implementation required - Initializes the components for the entity
     * @protected
     * @param {number} entityId - The entity ID
     * @param {...any} [args] - Additional arguments needed for initialization
     * @throws {Error}
     * @abstract
     */
    _initializeComponents(entityId, ...args) {
        throw new Error('_initializeComponents must be implemented by child classes');
    }

    /**
     * Creates a new entity with initialized components
     * @public
     * @param {...any} [args] - Arguments to pass to initializeComponents
     * @returns {number} The created entity ID
     * @throws {Error} If the _initializeComponents method is not implemented
     */
    create(...args) {
        const entityId = this.#createEntity();
        this._initializeComponents(entityId, ...args);
        return entityId;
    }
}

export default BaseEntityFactory;