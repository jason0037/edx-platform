define(["jquery", "underscore", "js/spec_helpers/create_sinon", "js/spec_helpers/edit_helpers",
    "js/views/modals/edit_xblock", "js/models/xblock_info"],
    function ($, _, create_sinon, edit_helpers, EditXBlockModal, XBlockInfo) {

        describe("EditXBlockModal", function() {
            var model, modal, showModal;

            showModal = function(requests, mockHtml, options) {
                var xblockElement = $('.xblock');
                return edit_helpers.showEditModal(requests, xblockElement, model, mockHtml, options);
            };

            beforeEach(function () {
                edit_helpers.installEditTemplates();
                appendSetFixtures('<div class="xblock" data-locator="mock-xblock" data-display-name="Mock XBlock"></div>');
                model = new XBlockInfo({
                    id: 'testCourse/branch/draft/block/verticalFFF',
                    display_name: 'Test Unit',
                    category: 'vertical'
                });
            });

            afterEach(function() {
                edit_helpers.cancelModalIfShowing();
            });

            describe("XBlock Editor", function() {
                var mockXBlockEditorHtml;

                mockXBlockEditorHtml = readFixtures('mock/mock-xblock-editor.underscore');

                beforeEach(function () {
                    edit_helpers.installMockXBlock();
                });

                afterEach(function() {
                    edit_helpers.uninstallMockXBlock();
                });

                it('can show itself', function() {
                    var requests = create_sinon.requests(this);
                    modal = showModal(requests, mockXBlockEditorHtml);
                    expect(edit_helpers.isShowingModal(modal)).toBeTruthy();
                    edit_helpers.cancelModal(modal);
                    expect(edit_helpers.isShowingModal(modal)).toBeFalsy();
                });

                it('does not show the "Save" button', function() {
                    var requests = create_sinon.requests(this);
                    modal = showModal(requests, mockXBlockEditorHtml);
                    expect(modal.$('.action-save')).not.toBeVisible();
                    expect(modal.$('.action-cancel').text()).toBe('OK');
                });

                it('shows the correct title', function() {
                    var requests = create_sinon.requests(this);
                    modal = showModal(requests, mockXBlockEditorHtml);
                    expect(modal.$('.modal-window-title').text()).toBe('Editing: Component');
                });

                it('does not show any editor mode buttons', function() {
                    var requests = create_sinon.requests(this);
                    modal = showModal(requests, mockXBlockEditorHtml);
                    expect(modal.$('.editor-modes a').length).toBe(0);
                });

                it('hides itself and refreshes after save notification', function() {
                    var requests = create_sinon.requests(this),
                        refreshed = false,
                        refresh = function() {
                            refreshed = true;
                        };
                    modal = showModal(requests, mockXBlockEditorHtml, { refresh: refresh });
                    modal.runtime.notify('save', { state: 'start' });
                    modal.runtime.notify('save', { state: 'end' });
                    expect(edit_helpers.isShowingModal(modal)).toBeFalsy();
                    expect(refreshed).toBeTruthy();
                });

                it('hides itself and does not refresh after cancel notification', function() {
                    var requests = create_sinon.requests(this),
                        refreshed = false,
                        refresh = function() {
                            refreshed = true;
                        };
                    modal = showModal(requests, mockXBlockEditorHtml, { refresh: refresh });
                    modal.runtime.notify('cancel');
                    expect(edit_helpers.isShowingModal(modal)).toBeFalsy();
                    expect(refreshed).toBeFalsy();
                });

                describe("Custom Buttons", function() {
                    var mockCustomButtonsHtml;

                    mockCustomButtonsHtml = readFixtures('mock/mock-xblock-editor-with-custom-buttons.underscore');

                    it('hides the modal\'s button bar', function() {
                        var requests = create_sinon.requests(this);
                        modal = showModal(requests, mockCustomButtonsHtml);
                        expect(modal.$('.modal-actions')).toBeHidden();
                    });
                });
            });

            describe("XModule Editor", function() {
                var mockXModuleEditorHtml;

                mockXModuleEditorHtml = readFixtures('mock/mock-xmodule-editor.underscore');

                beforeEach(function() {
                    edit_helpers.installMockXModule();
                });

                afterEach(function () {
                    edit_helpers.uninstallMockXModule();
                });

                it('can render itself', function() {
                    var requests = create_sinon.requests(this);
                    modal = showModal(requests, mockXModuleEditorHtml);
                    expect(edit_helpers.isShowingModal(modal)).toBeTruthy();
                    edit_helpers.cancelModal(modal);
                    expect(edit_helpers.isShowingModal(modal)).toBeFalsy();
                });

                it('shows the correct title', function() {
                    var requests = create_sinon.requests(this);
                    modal = showModal(requests, mockXModuleEditorHtml);
                    expect(modal.$('.modal-window-title').text()).toBe('Editing: Component');
                });

                it('shows the correct default buttons', function() {
                    var requests = create_sinon.requests(this),
                        editorButton,
                        settingsButton;
                    modal = showModal(requests, mockXModuleEditorHtml);
                    expect(modal.$('.editor-modes a').length).toBe(2);
                    editorButton = modal.$('.editor-button');
                    settingsButton = modal.$('.settings-button');
                    expect(editorButton.length).toBe(1);
                    expect(editorButton).toHaveClass('is-set');
                    expect(settingsButton.length).toBe(1);
                    expect(settingsButton).not.toHaveClass('is-set');
                });

                it('can switch tabs', function() {
                    var requests = create_sinon.requests(this),
                        editorButton,
                        settingsButton;
                    modal = showModal(requests, mockXModuleEditorHtml);
                    expect(modal.$('.editor-modes a').length).toBe(2);
                    editorButton = modal.$('.editor-button');
                    settingsButton = modal.$('.settings-button');
                    expect(modal.$('.metadata_edit')).toHaveClass('is-inactive');
                    settingsButton.click();
                    expect(modal.$('.metadata_edit')).toHaveClass('is-active');
                    editorButton.click();
                    expect(modal.$('.metadata_edit')).toHaveClass('is-inactive');
                });

                describe("Custom Tabs", function() {
                    var mockCustomTabsHtml;

                    mockCustomTabsHtml = readFixtures('mock/mock-xmodule-editor-with-custom-tabs.underscore');

                    it('hides the modal\'s header', function() {
                        var requests = create_sinon.requests(this);
                        modal = showModal(requests, mockCustomTabsHtml);
                        expect(modal.$('.modal-header')).toBeHidden();
                    });

                    it('shows the correct title', function() {
                        var requests = create_sinon.requests(this);
                        modal = showModal(requests, mockCustomTabsHtml);
                        expect(modal.$('.component-name').text()).toBe('Editing: Component');
                    });
                });
            });

            describe("XModule Editor (settings only)", function() {
                var mockXModuleEditorHtml;

                mockXModuleEditorHtml = readFixtures('mock/mock-xmodule-settings-only-editor.underscore');

                beforeEach(function() {
                    edit_helpers.installMockXModule();
                });

                afterEach(function () {
                    edit_helpers.uninstallMockXModule();
                });

                it('can render itself', function() {
                    var requests = create_sinon.requests(this);
                    modal = showModal(requests, mockXModuleEditorHtml);
                    expect(edit_helpers.isShowingModal(modal)).toBeTruthy();
                    edit_helpers.cancelModal(modal);
                    expect(edit_helpers.isShowingModal(modal)).toBeFalsy();
                });

                it('does not show any mode buttons', function() {
                    var requests = create_sinon.requests(this);
                    modal = showModal(requests, mockXModuleEditorHtml);
                    expect(modal.$('.editor-modes li').length).toBe(0);
                });
            });
        });
    });
