## Functions

<dl>
<dt><a href="#getCollection">getCollection()</a> ⇒ <code>Collection</code></dt>
<dd><p>Get collection for data processing. Each collection is stored with one file.</p>
</dd>
<dt><a href="#createFakeDriver">createFakeDriver()</a> ⇒ <code>Driver</code></dt>
<dd><p>Create fake model for testing.</p>
</dd>
<dt><a href="#extractControls">extractControls(doc, controlNames)</a> ⇒ <code>object</code></dt>
<dd><p>Extract specific name from object.</p>
</dd>
<dt><a href="#doList">doList(collection, query)</a> ⇒ <code>object</code></dt>
<dd><p>List documents.</p>
</dd>
<dt><a href="#doGet">doGet(collection, id)</a> ⇒ <code>Document</code></dt>
<dd><p>Get a document by id.</p>
</dd>
<dt><a href="#doCreate">doCreate(collection, _schema, doc)</a> ⇒ <code>Document</code></dt>
<dd><p>Create a new document</p>
</dd>
<dt><a href="#doPatch">doPatch(collection, schema, id, doc)</a> ⇒ <code>number</code></dt>
<dd><p>Patch documents.</p>
</dd>
<dt><a href="#doRemove">doRemove(collection, id)</a> ⇒ <code>number</code></dt>
<dd><p>Remove documents</p>
</dd>
<dt><a href="#createModel">createModel(driver, rawSchema)</a> ⇒ <code><a href="#Model">Model</a></code></dt>
<dd><p>Create a model with schema validation and transformation.</p>
</dd>
<dt><a href="#isEmptyValue">isEmptyValue(value)</a> ⇒ <code>boolean</code></dt>
<dd><p>Check value is empty or not.</p>
</dd>
<dt><a href="#validate">validate(schema, doc, patchMode)</a> ⇒ <code>Document</code></dt>
<dd><p>Validate document by schema</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Schema">Schema</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#Model">Model</a> : <code>object</code></dt>
<dd><p>Model structure.</p>
</dd>
</dl>

<a name="getCollection"></a>

## getCollection() ⇒ <code>Collection</code>
Get collection for data processing. Each collection is stored with one file.

**Kind**: global function  
**Returns**: <code>Collection</code> - Collection handlers.  
<a name="createFakeDriver"></a>

## createFakeDriver() ⇒ <code>Driver</code>
Create fake model for testing.

**Kind**: global function  
**Returns**: <code>Driver</code> - Driver handler.  
<a name="extractControls"></a>

## extractControls(doc, controlNames) ⇒ <code>object</code>
Extract specific name from object.

**Kind**: global function  
**Returns**: <code>object</code> - contain `controls` property and `doc` property.  

| Param | Type | Description |
| --- | --- | --- |
| doc | <code>object</code> | Origin object. |
| controlNames | <code>Array.&lt;string&gt;</code> | List of name needed. |

<a name="doList"></a>

## doList(collection, query) ⇒ <code>object</code>
List documents.

**Kind**: global function  
**Returns**: <code>object</code> - List result, contains: total (total of query result), skip (no skip documents), limit (no limit documents), data (list document).  

| Param | Type | Description |
| --- | --- | --- |
| collection | <code>Collection</code> | Collection want to handle. |
| query | <code>object</code> | Match exact query object. May be contain controls with $ prefix: $limit, $sort, $skip |

<a name="doGet"></a>

## doGet(collection, id) ⇒ <code>Document</code>
Get a document by id.

**Kind**: global function  
**Returns**: <code>Document</code> - Document needed.  

| Param | Type | Description |
| --- | --- | --- |
| collection | <code>Collection</code> | Collection want to handle. |
| id | <code>\*</code> | Id of document need to find. |

<a name="doCreate"></a>

## doCreate(collection, _schema, doc) ⇒ <code>Document</code>
Create a new document

**Kind**: global function  
**Returns**: <code>Document</code> - A created document.  

| Param | Type | Description |
| --- | --- | --- |
| collection | <code>Collection</code> | Collection want to handle. Required. |
| _schema | [<code>Schema</code>](#Schema) | Shape of data. Required. |
| doc | <code>Document</code> | A document to be created. Required. |

<a name="doPatch"></a>

## doPatch(collection, schema, id, doc) ⇒ <code>number</code>
Patch documents.

**Kind**: global function  
**Returns**: <code>number</code> - No of changed documents.  

| Param | Type | Description |
| --- | --- | --- |
| collection | <code>Collection</code> | Collection want to handle. Required. |
| schema | [<code>Schema</code>](#Schema) | Shape of data. Required. |
| id | <code>string</code> | Id of document need to find. |
| doc | <code>object</code> | Data to patch, maybe contain controls with $ prefix: $inc. |

<a name="doRemove"></a>

## doRemove(collection, id) ⇒ <code>number</code>
Remove documents

**Kind**: global function  
**Returns**: <code>number</code> - No removed document.  

| Param | Type | Description |
| --- | --- | --- |
| collection | <code>Collection</code> | Collection want to handle. Required. |
| id | <code>string</code> | Id of document need to find. |

<a name="createModel"></a>

## createModel(driver, rawSchema) ⇒ [<code>Model</code>](#Model)
Create a model with schema validation and transformation.

**Kind**: global function  
**Returns**: [<code>Model</code>](#Model) - Return model.  

| Param | Type | Description |
| --- | --- | --- |
| driver | <code>Driver</code> | Driver for handle. |
| rawSchema | [<code>Schema</code>](#Schema) | Schema for validation and transformation. |

<a name="isEmptyValue"></a>

## isEmptyValue(value) ⇒ <code>boolean</code>
Check value is empty or not.

**Kind**: global function  
**Returns**: <code>boolean</code> - checked result  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | Value to check |

<a name="validate"></a>

## validate(schema, doc, patchMode) ⇒ <code>Document</code>
Validate document by schema

**Kind**: global function  
**Returns**: <code>Document</code> - Validated document.  

| Param | Type | Description |
| --- | --- | --- |
| schema | [<code>Schema</code>](#Schema) | Schema for validation. |
| doc | <code>Document</code> | Document to validate. |
| patchMode | <code>boolean</code> | Enable patch method. |

<a name="Schema"></a>

## Schema : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| __name | <code>string</code> | (required) Model name. |
| __type | <code>string</code> | Model type (used in platform/model). |

<a name="Model"></a>

## Model : <code>object</code>
Model structure.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| get | <code>function</code> | Get document by id. |
| list | <code>function</code> | List document by query. |
| create | <code>function</code> | Create a new document. |
| patch | <code>function</code> | Update existed documents. |
| remove | <code>function</code> | Remove documents. |

