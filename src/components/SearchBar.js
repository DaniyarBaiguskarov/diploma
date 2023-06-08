import { useState } from 'react'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'

const SearchBar = ({ handleInput, search, options, handleOptionChange, idProp }) => {
  //   const handle = (e) => {
  //     console.log(e.target.value)
  //   }
  //   console.log(handleInput)
  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault()
    }
  }
  const [val, setVal] = useState(1)
  const onChange = (event) => {
    const value = event.target.value
    setVal(value)
    handleOptionChange(value)
  }
  return (
    <Container className="mb-2">
      <Row style={{ width: 'auto' }}>
        <Col>
          <Form className="d-flex">
            <Form.Control
              type="search"
              // onChange={(e) => {
              //   e.preventDefault()
              //   handleInput(e.target.value)
              // }}
              onKeyDown={handleKeyDown}
              onKeyUp={search}
              placeholder="Поиск..."
              className="me-2"
              aria-label="Search"
              id={idProp}
            />
            <Form.Select onChange={onChange} value={val}>
              {/* <option>Выберите столбец</option> */}
              {options.map((item, index) => (
                <option key={item.name} onClick={() => setVal(item.value)} value={item.value}>
                  {item.name}
                </option>
              ))}
              {/* <option value="1">Имя</option>
              <option value="2">Статус</option>
              <option value="3">Three</option> */}
            </Form.Select>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

export default SearchBar
