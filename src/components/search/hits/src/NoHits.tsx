import * as _ from "lodash";
import * as React from "react";
import "../styles/no-hits.scss";

import {
	SearchkitComponent,
	SearchkitComponentProps,
	FastClick,
	NoFiltersHitCountAccessor,
	SuggestionsAccessor
} from "../../../../core"

export interface NoHitsProps extends SearchkitComponentProps {
	suggestionsField?:string
}

export class NoHits extends SearchkitComponent<NoHitsProps, any> {
	noFiltersAccessor:NoFiltersHitCountAccessor
	suggestionsAccessor:SuggestionsAccessor

	static translations = {
		"NoHits.NoResultsFound":"No results found for {query}.",
		"NoHits.DidYouMean":"Did you mean {suggestion}?",
		"NoHits.SearchWithoutFilters":"Search for {query} only"
	}
	translations = NoHits.translations

	static propTypes = _.defaults({
		suggestionsField:React.PropTypes.string,
		translations:SearchkitComponent.translationsPropType(
			NoHits.translations
		)
	}, SearchkitComponent.propTypes)

	componentWillMount(){
		super.componentWillMount()
		this.noFiltersAccessor = this.searchkit.addAccessor(
			new NoFiltersHitCountAccessor()
		)
		if(this.props.suggestionsField){
			this.suggestionsAccessor = this.searchkit.addAccessor(
				new SuggestionsAccessor(this.props.suggestionsField)
			)
		}
	}

	defineBEMBlocks() {
		let block = (this.props.mod || "no-hits")
		return {
			container: block
		}
	}

	renderSuggestions() {
		if(this.suggestionsAccessor){
			let suggestion = this.suggestionsAccessor.getSuggestion()
			if(suggestion){
				return (
					<FastClick handler={this.setQueryString.bind(this,suggestion)}>
						<div className={this.bemBlocks.container("suggestion")}>
							{this.translate("NoHits.DidYouMean", {suggestion})}
						</div>
					</FastClick>
				)
			}
		}
		return null
	}

	setQueryString(query) {
		this.searchkit.getQueryAccessor().setQueryString(query)
		this.searchkit.performSearch(true)
	}

	resetFilters() {
		this.searchkit.getQueryAccessor().keepOnlyQueryState()
		this.searchkit.performSearch(true)
	}

	renderResetFilters() {
		if(this.noFiltersAccessor){
			if(this.noFiltersAccessor.getCount() > 0){
				let query = this.getQuery().getQueryString()
				return (
					<FastClick handler={this.resetFilters.bind(this)}>
						<div className={this.bemBlocks.container("reset-filters")}>
							{this.translate("NoHits.SearchWithoutFilters",{query})}
						</div>
					</FastClick>
				)
			}
		}
		return null
	}


	render() {
    if (this.hasHits() || this.isInitialLoading() || this.isLoading()) return null

		let suggestions = _.compact([this.renderResetFilters(),this.renderSuggestions()])
		let query = this.searchkit.getQueryAccessor().getQueryString()

		if (suggestions.length == 2) {
			suggestions.splice(1,0,<span key="or"> or </span>)
		}

		return (
			<div data-qa="no-hits" className={this.bemBlocks.container()}>
				<div className={this.bemBlocks.container("info")}>
					{this.translate("NoHits.NoResultsFound", {query:query})}
				</div>
				<div className={this.bemBlocks.container("steps")}>
					{suggestions}
				</div>
      </div>
		);
	}
}
