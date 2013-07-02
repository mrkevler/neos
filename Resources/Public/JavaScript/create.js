define(
	[
		'Library/jquery-with-dependencies',
		'vie/instance',
		'emberjs',
		'Content/InputEvents/EntitySelection',
		'Library/create',
		'Library/hallo',
		'halloplugins/linkplugin',
		'create/collectionWidgets/jquery.typo3.collectionWidget',
		'aloha'
	],
	function($, vieInstance, Ember, EntitySelection) {
		if (window._requirejsLoadingTrace) window._requirejsLoadingTrace.push('create');

		return Ember.Object.create({
				// Initially set state to null
			_state: null,

			initialize: function() {
				var that = this;

				if (!T3.Content.Controller.Preview.get('previewMode')) {
						// Wait until Aloha is loaded if we use Aloha
					if (Aloha.__shouldInit) {
						// very bad workaround for initializing aloha.
						window.setTimeout(function() {
							Aloha.ready(function() {
								that.enableEdit();
							});
						}, 800);
					} else {
						this.enableEdit();
					}
				}

				EntitySelection.initialize();
				this.initializeAlohaEntitySelectionWorkaround();
			},

			enableEdit: function() {
				var editableOptions = {
					disabled: false,
					vie: vieInstance,
					widgets: {
						'default': 'aloha'
					},
					collectionWidgets: {
						'default': 'typo3CollectionWidget'
					},
					editors: {
						aloha: {
							widget: 'alohaWidget'
						},
						'inline-only': {
							widget: 'editWidget'
						}
					}
				};

				$('[about]').each(function() {
					$(this).midgardEditable(editableOptions);
				});

				this.set('_state', 'edit');
			},

			disableEdit: function() {
				var editableOptions = {
					disabled: true,
					vie: vieInstance
				};
				$('.neos-contentelement[about]').each(function() {
					$(this).midgardEditable(editableOptions);
					$(this).removeClass('ui-state-disabled');
				});
				this.set('_state', 'browse');
			},

			/**
			 * WORKAROUND: When Aloha-Tables inside a content element are selected, we want
			 * to make the full content element selected as well.
			 *
			 * Somehow, Aloha catches bubbling events which we depend upon in the above event
			 * listeners. That's why we also register a listener for "midgardeditableactivated".
			 *
			 * However, *only* depending on this event handler is also not enough, because it is
			 * not thrown for content elements which do not contain any editables.
			 */
			initializeAlohaEntitySelectionWorkaround: function() {
				$(document).on('midgardeditableactivated', '.neos-contentelement', function(e) {
					T3.Content.Model.NodeSelection.updateSelection($(this));
					// make sure that the event is only fired for the *innermost* content element.
					e.stopPropagation();
				});
			}
		});
	}
);
