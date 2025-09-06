import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { searchProducts } from '../actions/productActions'
import { SEARCH_PRODUCTS_RESET } from '../constants'

function SearchBarForProducts() {
    const dispatch = useDispatch()
    const [searchTerm, setSearchTerm] = useState("")

    // Debounced search function
    const debouncedSearch = useCallback(
        (() => {
            let timeoutId
            return (term) => {
                clearTimeout(timeoutId)
                timeoutId = setTimeout(() => {
                    if (term.trim()) {
                        dispatch(searchProducts(term))
                    } else {
                        dispatch({ type: SEARCH_PRODUCTS_RESET })
                    }
                }, 300) // 300ms delay
            }
        })(),
        [dispatch]
    )

    // Handle input change with debouncing
    const handleInputChange = (e) => {
        const value = e.target.value
        setSearchTerm(value)
        debouncedSearch(value)
    }

    // Clear search when component unmounts
    useEffect(() => {
        return () => {
            dispatch({ type: SEARCH_PRODUCTS_RESET })
        }
    }, [dispatch])

    const onSubmit = (e) => {
        e.preventDefault();
        if(searchTerm.trim()) {
            dispatch(searchProducts(searchTerm))
        }
    };

    const clearSearch = () => {
        setSearchTerm("")
        dispatch({ type: SEARCH_PRODUCTS_RESET })
    }

    return (
        <div>
            <form onSubmit={onSubmit}>
                <span
                    style={{ display: "flex", alignItems: "center" }}
                    className=""
                >
                    <div style={{ position: "relative", flex: 1 }}>
                        <input
                            type="text"
                            value={searchTerm}
                            placeholder="Search products by name or description..."
                            className="form-control"
                            onChange={handleInputChange}
                            style={{ paddingRight: searchTerm ? "40px" : "12px" }}
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                style={{
                                    position: "absolute",
                                    right: "8px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    color: "#666",
                                    cursor: "pointer",
                                    padding: "4px"
                                }}
                                title="Clear search"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary ml-2 button-focus-css"
                        disabled={!searchTerm.trim()}
                    >
                        <i className="fas fa-search"></i>
                    </button>
                </span>
            </form>
        </div>
    )
}

export default SearchBarForProducts
