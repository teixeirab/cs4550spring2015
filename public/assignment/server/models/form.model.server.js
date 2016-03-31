// load q promise library
var q = require("q");

var mock = require("./form.mock.json");
var fields = require("./field.mock.json");
module.exports = function(uuid, db, mongoose) {

    // load form and fields schema
    var FormSchema = require("./form.schema.server.js")(mongoose);
    var FieldSchema = require("./field.schema.server.js")(mongoose);

    // create form model from schema
    var FormModel = mongoose.model('Form', FormSchema);
    var FieldModel = mongoose.model('Field', FieldSchema);

    var api = {
        // Forms Service
        findAllFormsForUser: findAllFormsForUser,
        createFormForUser : createFormForUser,
        deleteFormById : deleteFormById,
        updateFormById : updateFormById,
        // Fields Service
        getFieldsForForm : getFieldsForForm,
        getFieldForForm : getFieldForForm,
        deleteFieldFromForm : deleteFieldFromForm,
        getFieldTemplateType : getFieldTemplate,
        updateField : updateField,
        createFieldForForm: createFieldForForm
    };
    return api;

    //FORMS
    function findAllFormsForUser(userId){
        var userForms = [];
        for (var f in mock) {
            if (mock[f].userId === parseInt(userId)) {
                userForms.push(mock[f]);
            }
        }
        return userForms;
    }

    function createFormForUser(form, userId){
        var newForm = {
            _id: uuid.v4(),
            title: form.title,
            userId: parseInt(userId),
            fields: []
        };
        mock.push(newForm);
        return findAllFormsForUser(userId);
    }


    function deleteFormById(formId){
        var hit;
        for (var f in mock) {
            if (mock[f]._id === formId) {
                hit = mock[f].userId;
                mock.splice(f, 1);
                return findAllFormsForUser(hit);
            }
        }
    }

    function updateFormById (formId, newForm) {
        var hit;
        for (var f in mock) {
            if (mock[f]._id === formId) {
                hit = mock[f].userId;
                mock[f] = newForm;
                console.log(newForm)
                return findAllFormsForUser(hit)
            }
        }
    }

    // FIELDS
    function getFieldsForForm(formId) {
        for (var f in mock) {
            if (mock[f]._id == formId) {
                return mock[f].fields;
            }
        }
        return null;
    }

    function getFieldForForm(formId, fieldId) {
        for (var f in mock) {
            if (mock[f]._id == formId) {
                for (var i = 0; i < mock[f].fields.length; i++) {
                    if (mock[f].fields[i]._id == fieldId) {
                        return mock[f].fields[i]._id;
                    }
                }
            }
        }
        return null;
    }

    function deleteFieldFromForm(formId, fieldId) {
        for (var f in mock) {
            if (mock[f]._id == formId) {
                for (var i in mock[f].fields) {
                    if (mock[f].fields[i]._id == fieldId) {
                        mock[f].fields.splice(i, 1);
                        return mock[f].fields;
                    }
                }
            }
        }
        return null;
    }

    function getFieldTemplate(fieldType) {
        for (var f in fields) {
            if (fields[f].type.toLowerCase() == fieldType.toLowerCase()) {
                fields[f]._id = uuid.v4();
                return fields[f];
            }
        }
        return null;
    }

    function createFieldForForm(formId, field) {
        field._id = uuid.v4();

        for (var f in mock) {
            if (mock[f]._id == formId) {
                mock[f].fields.push(field);
                return mock[f].fields;
            }
        }
        return null;
    }

    function updateField(formId, fieldId, field) {
        for (var f in mock) {
            if (mock[f]._id == formId) {
                for (var i in mock[f].fields) {
                    if (mock[f].fields[i]._id == fieldId) {
                        mock[f].fields[i].label = field.label;
                        mock[f].fields[i].placeholder = field.placeholder;
                        if (field.options && mock[f].fields[i].options) {
                            mock[f].fields[i].options = field.options;
                        }
                        return mock[f].fields[i];
                    }
                }
            }
        }
    }

};